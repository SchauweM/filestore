import { Filestore } from '../filestore';
import { logger } from '@runejs/core';
import { SpriteStore, toRgb } from './sprite-store';
import { ColorUtils } from './model-store';
import { PNG } from 'pngjs';
import { existsSync, mkdirSync, rmdirSync, writeFileSync } from 'fs';


export class Texture {

    public static LOW_MEMORY_TEXTURE_SIZE = 64;
    public static HIGH_MEMORY_TEXTURE_SIZE = 128;
    private static pixelsBuffer: number[];

    id: number;

    anInt2137: number;
    aBoolean2143: boolean;
    spriteIds: number[];
    renderTypes: number[];
    anIntArray2138: number[];
    colors: number[];
    direction: number;
    speed: number;

    pixels: number[];

    public generatePixels(intensity: number, size: number, spriteStore: SpriteStore): boolean {
        if (this.pixels) {
            return true;
        }
        const spritePacks = [];
        for (let i = 0; i < this.spriteIds.length; i++) {
            const spritePack = spriteStore.getSpritePack(this.spriteIds[i]);
            if (spritePack == null) {
                return false;
            }
            spritePack.decode();
            spritePacks.push(spritePack);
        }
        let colorCount = size * size;
        this.pixels = new Array<number>(colorCount * 4);
        for (let i = 0; i < this.spriteIds.length; i++) {
            const sprite = spritePacks[i].sprites[0];
            sprite.resizeToLibSize();
            const spritePixels = sprite.pixelIdx;
            const spritePalette = sprite.palette;
            const color = this.colors[i];
            if ((color & ~0xffffff) == 50331648) {
                const i_15_ = color & 0xff00ff;
                const i_16_ = color >> 8 & 0xff;
                for (let j = 0; j < spritePalette.length; j++) {
                    let i_18_ = spritePalette[j];
                    if ((i_18_ & 0xffff) == i_18_ >> 8) {
                        i_18_ &= 0xff;
                        spritePalette[j] = i_15_ * i_18_ >> 8 & 0xff00ff | i_16_ * i_18_ & 0xff00;
                    }
                }
            }
            for (let j = 0; j < spritePalette.length; j++) {
                spritePalette[j] = ColorUtils.method707(spritePalette[j], intensity);
            }
            let renderType;
            if (i == 0) {
                renderType = 0;
            } else {
                renderType = this.renderTypes[i - 1];
            }
            if (renderType == 0) {
                if (sprite.width == size) {
                    for (let j = 0; j < colorCount; j++) {
                        this.pixels[j] = spritePalette[spritePixels[j] & 0xff];
                    }
                } else if (sprite.width == 64 && size == 128) {
                    let index = 0;
                    for (let i_23_ = 0; i_23_ < size; i_23_++) {
                        for (let i_24_ = 0; i_24_ < size; i_24_++) {
                            this.pixels[index++] = spritePalette[spritePixels[(i_24_ >> 1) + (i_23_ >> 1 << 6)] & 0xff];
                        }
                    }
                } else if (sprite.width == 128 && size == 64) {
                    let index = 0;
                    for (let i_26_ = 0; i_26_ < size; i_26_++) {
                        for (let i_27_ = 0; i_27_ < size; i_27_++) {
                            this.pixels[index++] = spritePalette[spritePixels[(i_27_ << 1) + (i_26_ << 1 << 7)] & 0xff];
                        }
                    }
                } else {
                    throw new Error();
                }
            }
        }
        for (let i = 0; i < colorCount; i++) {
            this.pixels[i] &= 0xf8f8ff;
            const i_29_ = this.pixels[i];
            this.pixels[i + colorCount] = i_29_ - (i_29_ >>> 3) & 0xf8f8ff;
            this.pixels[i + colorCount + colorCount] = i_29_ - (i_29_ >>> 2) & 0xf8f8ff;
            this.pixels[i + colorCount + colorCount + colorCount] = i_29_ - (i_29_ >>> 2) - (i_29_ >>> 3) & 0xf8f8ff;
        }
        return true;
    }

    public animate(gameTick: number) {
        if (this.pixels != null) {
            if (this.direction == 1 || this.direction == 3) {
                if (Texture.pixelsBuffer == null || Texture.pixelsBuffer.length < this.pixels.length) {
                    Texture.pixelsBuffer = new Array(this.pixels.length);
                }
                let size;
                if (this.pixels.length == 16384) {
                    size = 64;
                } else {
                    size = 128;
                }
                const colorCount = this.pixels.length / 4;
                let textureSpeed = size * gameTick * this.speed;
                const colorCountMin1 = colorCount - 1;
                if (this.direction == 1) {
                    textureSpeed = -textureSpeed;
                }
                for (let i = 0; i < colorCount; i++) {
                    const i_4_ = i + textureSpeed & colorCountMin1;
                    Texture.pixelsBuffer[i] = this.pixels[i_4_];
                    Texture.pixelsBuffer[i + colorCount] = this.pixels[i_4_ + colorCount];
                    Texture.pixelsBuffer[i + colorCount + colorCount] = this.pixels[i_4_ + colorCount + colorCount];
                    Texture.pixelsBuffer[i + colorCount + colorCount + colorCount] = this.pixels[i_4_ + colorCount + colorCount + colorCount];
                }
                const is = this.pixels;
                this.pixels = Texture.pixelsBuffer;
                Texture.pixelsBuffer = is;
            }
            if (this.direction == 2 || this.direction == 4) {
                if (Texture.pixelsBuffer == null || Texture.pixelsBuffer.length < this.pixels.length) {
                    Texture.pixelsBuffer = new Array(this.pixels.length);
                }
                let size;
                if (this.pixels.length == 16384) {
                    size = 64;
                } else {
                    size = 128;
                }
                const colorCount = this.pixels.length / 4;
                let textureSpeed = gameTick * this.speed;
                const sizeMin1 = size - 1;
                if (this.direction == 2) {
                    textureSpeed = -textureSpeed;
                }
                for (let x = 0; x < colorCount; x += size) {
                    for (let y = 0; y < size; y++) {
                        const i_10_ = x + y;
                        const i_11_ = x + (y + textureSpeed & sizeMin1);
                        Texture.pixelsBuffer[i_10_] = this.pixels[i_11_];
                        Texture.pixelsBuffer[i_10_ + colorCount] = this.pixels[i_11_ + colorCount];
                        Texture.pixelsBuffer[i_10_ + colorCount + colorCount] = this.pixels[i_11_ + colorCount + colorCount];
                        Texture.pixelsBuffer[i_10_ + colorCount + colorCount + colorCount] = this.pixels[i_11_ + colorCount + colorCount + colorCount];
                    }
                }
                const is = this.pixels;
                this.pixels = Texture.pixelsBuffer;
                Texture.pixelsBuffer = is;
            }
        }
    }

    public async writeToDisk(size: number): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const path = './unpacked/textures';
                if (!existsSync(path)) {
                    mkdirSync(path);
                }
                const png = this.toPng(size);
                png.pack();
                const pngBuffer = PNG.sync.write(png);
                writeFileSync(path + `/${this.id}.png`, pngBuffer);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Converts the Texture into a base64 PNG image.
     */
    public async toBase64(size: number): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const png = this.toPng(size);

            try {
                png.pack();

                const chunks = [];

                png.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                png.on('end', () => {
                    const str = Buffer.concat(chunks).toString('base64');
                    resolve(str);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Converts the Texture into a PNG image and returns the resulting PNG object.
     */
    public toPng(size: number): PNG {
        const png = new PNG({
            width: size,
            height: size,
            filterType: -1
        });

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const pixel = this.pixels[size * y + x];
                const [r, g, b] = toRgb(pixel);
                const pngIndex = (size * y + x) << 2;

                png.data[pngIndex] = r;
                png.data[pngIndex + 1] = g;
                png.data[pngIndex + 2] = b;
                png.data[pngIndex + 3] = 255;
            }
        }

        return png;
    }

}


export class TextureStore {

    public constructor(private fileStore: Filestore) {
    }

    public async writeToDisk(size: number): Promise<void> {
        rmdirSync('./unpacked/textures', {recursive: true});
        const ids = this.fileStore.getIndex('textures').getArchive(0).files.keys();
        for (const id of ids) {
            try {
                const texture = this.getTexture(id);
                texture.generatePixels(0.7, size, this.fileStore.spriteStore);
                await texture.writeToDisk(size);
            } catch (e) {
                logger.error(`Error writing texture ${id} to disk.`);
                logger.error(e);
            }
        }
    }

    public getTexture(id: number): Texture | null {
        if (!id && id !== 0) {
            logger.warn(`Invalid texture id specified: ${id}`);
            return null;
        }
        const file = this.fileStore.getIndex('textures').getArchive(0).getFile(id);
        if (file == null) {
            logger.warn(`Texture file ${id} not found`);
            return null;
        }
        const buffer = file.content
        const texture = new Texture();
        texture.id = id;
        texture.anInt2137 = buffer.get('SHORT', 'UNSIGNED');
        texture.aBoolean2143 = buffer.get('BYTE', 'UNSIGNED') == 1;
        const spritesCount = buffer.get('BYTE', 'UNSIGNED');
        if (spritesCount < 1 || spritesCount > 4) {
            throw new Error();
        }
        texture.spriteIds = new Array<number>(spritesCount);
        for (let i = 0; i < spritesCount; i++) {
            texture.spriteIds[i] = buffer.get('SHORT', 'UNSIGNED');
        }
        if (spritesCount > 1) {
            texture.renderTypes = new Array<number>(spritesCount - 1);
            for (let i = 0; i < spritesCount - 1; i++) {
                texture.renderTypes[i] = buffer.get('BYTE', 'UNSIGNED');
            }
        }
        if (spritesCount > 1) {
            texture.anIntArray2138 = new Array<number>(spritesCount - 1);
            for (let i = 0; i < spritesCount - 1; i++) {
                texture.anIntArray2138[i] = buffer.get('BYTE', 'UNSIGNED');
            }
        }
        texture.colors = new Array<number>(spritesCount);
        for (let i = 0; i < spritesCount; i++) {
            texture.colors[i] = buffer.get('INT');
        }
        texture.direction = buffer.get('BYTE', 'UNSIGNED');
        texture.speed = buffer.get('BYTE', 'UNSIGNED');
        texture.pixels = null;
        return texture;
    }

}