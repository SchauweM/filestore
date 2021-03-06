import { Filestore } from '../filestore';
import { FileIndex } from '../file-index';
import { ByteBuffer, logger } from "@runejs/core";


export class RsModel {

    id: number;

    vertexCount: number;
    faceCount: number;
    texturedFaceCount: number;
    verticesX: number[];
    verticesY: number[];
    verticesZ: number[];
    faceIndicesA: Uint16Array;
    faceIndicesB: Uint16Array;
    faceIndicesC: Uint16Array;
    faceMappings: Uint8Array;
    texturedFaceIndicesA: Uint16Array;
    texturedFaceIndicesB: Uint16Array;
    texturedFaceIndicesC: Uint16Array;
    vertexSkins: number[];
    faceTypes: Uint8Array;
    facePriorities: Uint8Array;
    facePriority: number;
    faceAlphas: Uint8Array;
    faceSkins: number[];
    faceColors: Uint32Array;

    // meta
    faceColorsX: Uint32Array;
    faceColorsY: Uint32Array;
    faceColorsZ: Uint32Array;
    vertexNormals: VertexNormal[];
    vertexNormalOffsets: VertexNormal[];
    anInt3193: number;

    constructor() {
        this.texturedFaceCount = 0;
        this.vertexCount = 0;
        this.facePriority = 0;
    }

    public applyLighting(ambient: number, contrast: number, arg2: number, arg3: number, arg4: number, applyShading: boolean) {
        const i = Math.sqrt(arg2 * arg2 + arg3 * arg3 + arg4 * arg4);
        const i_50_ = contrast * i >> 8;
        if (this.faceColorsX == null) {
            this.faceColorsX = new Uint32Array(this.faceCount);
            this.faceColorsY = new Uint32Array(this.faceCount);
            this.faceColorsZ = new Uint32Array(this.faceCount);
        }
        if (this.vertexNormals == null) {
            this.vertexNormals = new Array<VertexNormal>(this.vertexCount);
            this.vertexNormals.fill(new VertexNormal());
        }
        for (let i_52_ = 0; i_52_ < this.faceCount; i_52_++) {
            const faceA = this.faceIndicesA[i_52_];
            const faceB = this.faceIndicesB[i_52_];
            const faceC = this.faceIndicesC[i_52_];
            const i_56_ = this.verticesX[faceB] - this.verticesX[faceA];
            const i_57_ = this.verticesY[faceB] - this.verticesY[faceA];
            const i_58_ = this.verticesZ[faceB] - this.verticesZ[faceA];
            const i_59_ = this.verticesX[faceC] - this.verticesX[faceA];
            const i_60_ = this.verticesY[faceC] - this.verticesY[faceA];
            const i_61_ = this.verticesZ[faceC] - this.verticesZ[faceA];
            let i_62_ = i_57_ * i_61_ - i_60_ * i_58_;
            let i_63_ = i_58_ * i_59_ - i_61_ * i_56_;
            let i_64_;
            for (i_64_ = i_56_ * i_60_ - i_59_ * i_57_;
                 i_62_ > 8192 || i_63_ > 8192 || i_64_ > 8192 || i_62_ < -8192 || i_63_ < -8192 || i_64_ < -8192;
                 i_64_ >>= 1) {
                i_62_ >>= 1;
                i_63_ >>= 1;
            }
            let i_65_ = Math.sqrt(i_62_ * i_62_ + i_63_ * i_63_ + i_64_ * i_64_);
            if (i_65_ <= 0) {
                i_65_ = 1;
            }
            i_62_ = i_62_ * 256 / i_65_;
            i_63_ = i_63_ * 256 / i_65_;
            i_64_ = i_64_ * 256 / i_65_;
            if (this.faceTypes == null || (this.faceTypes[i_52_] & 0x1) == 0) {
                let class46 = this.vertexNormals[faceA];
                class46.x += i_62_;
                class46.y += i_63_;
                class46.z += i_64_;
                class46.magnitude++;
                class46 = this.vertexNormals[faceB];
                class46.x += i_62_;
                class46.y += i_63_;
                class46.z += i_64_;
                class46.magnitude++;
                class46 = this.vertexNormals[faceC];
                class46.x += i_62_;
                class46.y += i_63_;
                class46.z += i_64_;
                class46.magnitude++;
            } else {
                const i_66_ = ambient + (arg2 * i_62_ + arg3 * i_63_ + arg4 * i_64_) / (i_50_ + i_50_ / 2);
                this.faceColorsX[i_52_] = ColorUtils.method816(this.faceColors[i_52_], i_66_, this.faceTypes[i_52_]);
            }
        }
        if (applyShading) {
            this.applyShading(ambient, i_50_, arg2, arg3, arg4);
        } else {
            this.vertexNormalOffsets = new Array<VertexNormal>(this.vertexCount);
            for (let i_67_ = 0; i_67_ < this.vertexCount; i_67_++) {
                const normal = this.vertexNormals[i_67_];
                const normalOffset = this.vertexNormalOffsets[i_67_] = new VertexNormal();
                normalOffset.x = normal.x;
                normalOffset.y = normal.y;
                normalOffset.z = normal.z;
                normalOffset.magnitude = normal.magnitude;
            }
            this.anInt3193 = (ambient << 16) + (i_50_ & 0xffff);
        }
    }

    public applyShading(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number) {
        for (let i = 0; i < this.faceCount; i++) {
            const faceA = this.faceIndicesA[i];
            const faceB = this.faceIndicesB[i];
            const faceC = this.faceIndicesC[i];
            if (this.faceTypes == null) {
                const faceColor = this.faceColors[i];
                let normal = this.vertexNormals[faceA];
                let i_76_ = arg0 + (arg2 * normal.x + arg3 * normal.y + arg4 * normal.z) / (arg1 * normal.magnitude);
                this.faceColorsX[i] = ColorUtils.method816(faceColor, i_76_, 0);
                normal = this.vertexNormals[faceB];
                i_76_ = arg0 + (arg2 * normal.x + arg3 * normal.y + arg4 * normal.z) / (arg1 * normal.magnitude);
                this.faceColorsY[i] = ColorUtils.method816(faceColor, i_76_, 0);
                normal = this.vertexNormals[faceC];
                i_76_ = arg0 + (arg2 * normal.x + arg3 * normal.y + arg4 * normal.z) / (arg1 * normal.magnitude);
                this.faceColorsZ[i] = ColorUtils.method816(faceColor, i_76_, 0);
            } else if ((this.faceTypes[i] & 0x1) == 0) {
                const faceColor = this.faceColors[i];
                const faceType = this.faceTypes[i];
                let normal = this.vertexNormals[faceA];
                let i_79_ = arg0 + (arg2 * normal.x + arg3 * normal.y + arg4 * normal.z) / (arg1 * normal.magnitude);
                this.faceColorsX[i] = ColorUtils.method816(faceColor, i_79_, faceType);
                normal = this.vertexNormals[faceB];
                i_79_ = arg0 + (arg2 * normal.x + arg3 * normal.y + arg4 * normal.z) / (arg1 * normal.magnitude);
                this.faceColorsY[i] = ColorUtils.method816(faceColor, i_79_, faceType);
                normal = this.vertexNormals[faceC];
                i_79_ = arg0 + (arg2 * normal.x + arg3 * normal.y + arg4 * normal.z) / (arg1 * normal.magnitude);
                this.faceColorsZ[i] = ColorUtils.method816(faceColor, i_79_, faceType);
            }
        }
    }

}

export class VertexNormal {
    x: number;
    y: number;
    z: number;
    magnitude: number;
}

export class ColorUtils {

    private static readonly UNKNOWN_COLOR_TABLE = ColorUtils.initUnknownColorTable();
    private static readonly HSB_TO_RGB = ColorUtils.initHsbToRgb(0.7, 0, 512);

    public static initUnknownColorTable(): Uint32Array {
        const table = new Uint32Array(128);
        let i = 0;
        let i_322_ = 248;
        while (i < 9) {
            table[i++] = 255;
        }
        while (i < 16) {
            table[i++] = i_322_;
            i_322_ -= 8;
        }
        while (i < 32) {
            table[i++] = i_322_;
            i_322_ -= 4;
        }
        while (i < 64) {
            table[i++] = i_322_;
            i_322_ -= 2;
        }
        while (i < 128) {
            table[i++] = i_322_--;
        }
        return table;
    }

    private static initHsbToRgb(arg0: number, arg1: number, arg2: number): Uint32Array {
        const table = new Uint32Array(65536);
        arg0 += Math.random() * 0.03 - 0.015;
        let i = arg1 * 128;
        for (let i_58_ = arg1; i_58_ < arg2; i_58_++) {
            const d = (i_58_ >> 3) / 64.0 + 0.0078125;
            const d_59_ = (i_58_ & 0x7) / 8.0 + 0.0625;
            for (let i_60_ = 0; i_60_ < 128; i_60_++) {
                const d_61_ = i_60_ / 128.0;
                let red = d_61_;
                let green = d_61_;
                let blue = d_61_;
                if (d_59_ !== 0.0) {
                    let d_65_;
                    if (d_61_ < 0.5) {
                        d_65_ = d_61_ * (1.0 + d_59_);
                    } else {
                        d_65_ = d_61_ + d_59_ - d_61_ * d_59_;
                    }
                    const d_66_ = 2.0 * d_61_ - d_65_;
                    let d_67_ = d + 0.3333333333333333;
                    if (d_67_ > 1.0) {
                        d_67_--;
                    }
                    const d_68_ = d;
                    let d_69_ = d - 0.3333333333333333;
                    if (d_69_ < 0.0) {
                        d_69_++;
                    }
                    if (6.0 * d_67_ < 1.0) {
                        red = d_66_ + (d_65_ - d_66_) * 6.0 * d_67_;
                    } else if (2.0 * d_67_ < 1.0) {
                        red = d_65_;
                    } else if (3.0 * d_67_ < 2.0) {
                        red = d_66_ + (d_65_ - d_66_) * (0.6666666666666666 - d_67_) * 6.0;
                    } else {
                        red = d_66_;
                    }
                    if (6.0 * d_68_ < 1.0) {
                        green = d_66_ + (d_65_ - d_66_) * 6.0 * d_68_;
                    } else if (2.0 * d_68_ < 1.0) {
                        green = d_65_;
                    } else if (3.0 * d_68_ < 2.0) {
                        green = d_66_ + (d_65_ - d_66_) * (0.6666666666666666 - d_68_) * 6.0;
                    } else {
                        green = d_66_;
                    }
                    if (6.0 * d_69_ < 1.0) {
                        blue = d_66_ + (d_65_ - d_66_) * 6.0 * d_69_;
                    } else if (2.0 * d_69_ < 1.0) {
                        blue = d_65_;
                    } else if (3.0 * d_69_ < 2.0) {
                        blue = d_66_ + (d_65_ - d_66_) * (0.6666666666666666 - d_69_) * 6.0;
                    } else {
                        blue = d_66_;
                    }
                }
                const redUByte = red * 256.0;
                const greenUByte = green * 256.0;
                const blueUByte = blue * 256.0;
                let rgb = (redUByte << 16) + (greenUByte << 8) + blueUByte;
                rgb = this.method707(rgb, arg0);
                if (rgb == 0) {
                    rgb = 1;
                }
                table[i++] = rgb;
            }
        }
        return table;
    }

    public static hsbToRgb(hsb: number): number {
        return this.HSB_TO_RGB[hsb];
    }

    public static method707(rgb: number, arg1: number) {
        let red = (rgb >> 16) / 256.0;
        let green = (rgb >> 8 & 0xff) / 256.0;
        let blue = (rgb & 0xff) / 256.0;
        red = Math.pow(red, arg1);
        green = Math.pow(green, arg1);
        blue = Math.pow(blue, arg1);
        const newRed = red * 256.0;
        const newGreen = green * 256.0;
        const newBlue = blue * 256.0;
        return (newRed << 16) + (newGreen << 8) + newBlue;
    }

    public static method816(faceColor: number, arg1: number, faceType: number): number {
        if ((faceType & 0x2) == 2) {
            if (arg1 < 0) {
                arg1 = 0;
            } else if (arg1 > 127) {
                arg1 = 127;
            }
            arg1 = this.UNKNOWN_COLOR_TABLE[arg1];
            return arg1;
        }
        arg1 = arg1 * (faceColor & 0x7f) >> 7;
        if (arg1 < 2) {
            arg1 = 2;
        } else if (arg1 > 126) {
            arg1 = 126;
        }
        return (faceColor & 0xff80) + arg1;
    }

    public static method709(arg0: number, arg1: number): number {
        arg1 = (127 - arg1) * (arg0 & 0x7f) >> 7;
        if(arg1 < 2) {
            arg1 = 2;
        } else if(arg1 > 126) {
            arg1 = 126;
        }
        return (arg0 & 0xff80) + arg1;
    }

    // custom shade function (i.e not from the client)
    public static shade(rgb: number, shadowRgb: number): number {
        let red = (rgb >> 16) / 256.0;
        let green = (rgb >> 8 & 0xff) / 256.0;
        let blue = (rgb & 0xff) / 256.0;
        let shadowRed = (shadowRgb >> 16 & 0xff) / 255.0;
        let shadowGreen = (shadowRgb >> 8 & 0xff) / 255.0;
        let shadowBlue = (shadowRgb & 0xff) / 255.0;
        red *= 1 - shadowRed;
        green *= 1 - shadowGreen;
        blue *= 1 - shadowBlue;
        const newRed = red * 256.0;
        const newGreen = green * 256.0;
        const newBlue = blue * 256.0;
        return (newRed << 16) + (newGreen << 8) + newBlue;
    }

}


/**
 * Controls model file storage.
 */
export class ModelStore {

    private readonly modelFileIndex: FileIndex;

    public constructor(private fileStore: Filestore) {
        this.modelFileIndex = this.fileStore.getIndex('models');
    }

    public getModel(id: number): RsModel | null {
        const file = this.modelFileIndex.getFile(id) || null;
        if(!file) {
            logger.warn(`Model file ${id} not found`);
            return null;
        }
        const rsModel = new RsModel();
        const buffer = file.content;
        buffer.readerIndex = 0;
        let vertexDirectionOffsetBuffer = new ByteBuffer(buffer);
        let xDataOffsetBuffer = new ByteBuffer(buffer);
        let yDataOffsetBuffer = new ByteBuffer(buffer);
        let zDataOffsetBuffer = new ByteBuffer(buffer);
        let vertexSkinOffsetBuffer = new ByteBuffer(buffer);
        vertexDirectionOffsetBuffer.readerIndex = buffer.length - 18;
        rsModel.vertexCount = vertexDirectionOffsetBuffer.get('SHORT', 'UNSIGNED');
        rsModel.faceCount = vertexDirectionOffsetBuffer.get('SHORT', 'UNSIGNED');
        rsModel.texturedFaceCount = vertexDirectionOffsetBuffer.get('BYTE', 'UNSIGNED');
        const hasFaceTypes = vertexDirectionOffsetBuffer.get('BYTE', 'UNSIGNED');
        const modelPriority = vertexDirectionOffsetBuffer.get('BYTE', 'UNSIGNED');
        const hasFaceAlphas = vertexDirectionOffsetBuffer.get('BYTE', 'UNSIGNED');
        const hasFaceSkins = vertexDirectionOffsetBuffer.get('BYTE', 'UNSIGNED');
        const hasVertexSkins = vertexDirectionOffsetBuffer.get('BYTE', 'UNSIGNED');
        const verticesXSubOffset = vertexDirectionOffsetBuffer.get('SHORT', 'UNSIGNED');
        const verticesYSubOffset = vertexDirectionOffsetBuffer.get('SHORT', 'UNSIGNED');
        const verticesZSubOffset = vertexDirectionOffsetBuffer.get('SHORT', 'UNSIGNED');
        const faceIndicesSubOffset = vertexDirectionOffsetBuffer.get('SHORT', 'UNSIGNED');
        let offset = 0;
        const vertexFlagsOffset = offset;
        offset += rsModel.vertexCount;
        const facesCompressTypeOffset = offset;
        offset += rsModel.faceCount;
        const facePrioritiesOffset = offset;
        if (modelPriority == 255) {
            offset += rsModel.faceCount;
        }
        const faceSkinsOffset = offset;
        if (hasFaceSkins == 1) {
            offset += rsModel.faceCount;
        }
        const faceTypesOffset = offset;
        if (hasFaceTypes == 1) {
            offset += rsModel.faceCount;
        }
        const vertexSkinsOffset = offset;
        if (hasVertexSkins == 1) {
            offset += rsModel.vertexCount;
        }
        const faceAlphasOffset = offset;
        if (hasFaceAlphas == 1) {
            offset += rsModel.faceCount;
        }
        const faceIndicesOffset = offset;
        offset += faceIndicesSubOffset;
        const faceColorsOffset = offset;
        offset += rsModel.faceCount * 2;
        const faceMappingsOffset = offset;
        offset += rsModel.texturedFaceCount * 6;
        const verticesXOffset = offset;
        offset += verticesXSubOffset;
        const verticesYOffset = offset;
        offset += verticesYSubOffset;
        const verticesZOffset = offset;
        offset += verticesZSubOffset;
        rsModel.verticesX = new Array(rsModel.vertexCount);
        rsModel.verticesY = new Array(rsModel.vertexCount);
        rsModel.verticesZ = new Array(rsModel.vertexCount);
        rsModel.faceIndicesA = new Uint16Array(rsModel.faceCount);
        rsModel.faceIndicesB = new Uint16Array(rsModel.faceCount);
        rsModel.faceIndicesC = new Uint16Array(rsModel.faceCount);
        if (rsModel.texturedFaceCount > 0) {
            rsModel.faceMappings = new Uint8Array(rsModel.texturedFaceCount);
            rsModel.texturedFaceIndicesA = new Uint16Array(rsModel.texturedFaceCount);
            rsModel.texturedFaceIndicesB = new Uint16Array(rsModel.texturedFaceCount);
            rsModel.texturedFaceIndicesC = new Uint16Array(rsModel.texturedFaceCount);
        }
        if (hasVertexSkins == 1) {
            rsModel.vertexSkins = new Array(rsModel.texturedFaceCount);
        }
        if (hasFaceTypes == 1) {
            rsModel.faceTypes = new Uint8Array(rsModel.faceCount);
        }
        if (modelPriority == 255) {
            rsModel.facePriorities = new Uint8Array(rsModel.faceCount);
        } else {
            rsModel.facePriority = modelPriority & 128;
        }
        if (hasFaceAlphas == 1) {
            rsModel.faceAlphas = new Uint8Array(rsModel.faceCount);
        }
        if (hasFaceSkins == 1) {
            rsModel.faceSkins = new Array(rsModel.faceCount);
        }
        rsModel.faceColors = new Uint32Array(rsModel.faceCount);
        vertexDirectionOffsetBuffer.readerIndex = vertexFlagsOffset;
        xDataOffsetBuffer.readerIndex = verticesXOffset;
        yDataOffsetBuffer.readerIndex = verticesYOffset;
        zDataOffsetBuffer.readerIndex = verticesZOffset;
        vertexSkinOffsetBuffer.readerIndex = vertexSkinsOffset;
        let baseOffsetX = 0;
        let baseOffsetY = 0;
        let baseOffsetZ = 0;
        for(let i = 0; i < rsModel.faceCount; i++) {
            const mask = vertexDirectionOffsetBuffer.get('BYTE', 'UNSIGNED');
            let xOffset = 0;
            if ((mask & 0x1) != 0) {
                xOffset = xDataOffsetBuffer.get('SMART', 'UNSIGNED');
            }
            let yOffset = 0;
            if ((mask & 0x2) != 0) {
                yOffset = yDataOffsetBuffer.get('SMART', 'UNSIGNED');
            }
            let zOffset = 0;
            if ((mask & 0x4) != 0) {
                zOffset = zDataOffsetBuffer.get('SMART', 'UNSIGNED');
            }
            rsModel.verticesX[i] = baseOffsetX + xOffset;
            rsModel.verticesY[i] = baseOffsetY + yOffset;
            rsModel.verticesZ[i] = baseOffsetZ + zOffset;
            baseOffsetX = rsModel.verticesX[i];
            baseOffsetY = rsModel.verticesY[i];
            baseOffsetZ = rsModel.verticesZ[i];
            if (hasVertexSkins == 1) {
                rsModel.vertexSkins[i] = vertexSkinOffsetBuffer.get('BYTE', 'UNSIGNED');
            }
        }
        vertexDirectionOffsetBuffer.readerIndex = faceColorsOffset;
        xDataOffsetBuffer.readerIndex = faceTypesOffset;
        yDataOffsetBuffer.readerIndex = facePrioritiesOffset;
        zDataOffsetBuffer.readerIndex = faceAlphasOffset;
        vertexSkinOffsetBuffer.readerIndex = faceSkinsOffset;
        for(let i = 0; i < rsModel.faceCount; i++) {
            rsModel.faceColors[i] = vertexDirectionOffsetBuffer.get('SHORT', 'UNSIGNED');
            if (hasFaceTypes == 1) {
                rsModel.faceTypes[i] = xDataOffsetBuffer.get('BYTE', 'UNSIGNED');
            }
            if (modelPriority == 255) {
                rsModel.facePriorities[i] = yDataOffsetBuffer.get('BYTE', 'UNSIGNED');
            }
            if (hasFaceAlphas == 1) {
                rsModel.faceAlphas[i] = zDataOffsetBuffer.get('BYTE', 'UNSIGNED');
            }
            if (hasFaceSkins == 1) {
                rsModel.faceSkins[i] = vertexSkinOffsetBuffer.get('BYTE', 'UNSIGNED');
            }
        }
        vertexDirectionOffsetBuffer.readerIndex = faceIndicesOffset;
        xDataOffsetBuffer.readerIndex = facesCompressTypeOffset;
        let lastA = 0;
        let lastB = 0;
        let lastC = 0;
        let accumulator = 0;
        for(let i = 0; i < rsModel.faceCount; i++) {
            const type = xDataOffsetBuffer.get('BYTE', 'UNSIGNED');
            switch(type) {
                case 1:
                    lastA = vertexDirectionOffsetBuffer.get('SMART', 'UNSIGNED') + accumulator;
                    accumulator = lastA;
                    lastB = vertexDirectionOffsetBuffer.get('SMART', 'UNSIGNED') + accumulator;
                    accumulator = lastB;
                    lastC = vertexDirectionOffsetBuffer.get('SMART', 'UNSIGNED') + accumulator;
                    accumulator = lastC;
                    rsModel.faceIndicesA[i] = lastA;
                    rsModel.faceIndicesB[i] = lastB;
                    rsModel.faceIndicesC[i] = lastC;
                    break;
                case 2:
                    lastB = lastC;
                    lastC = vertexDirectionOffsetBuffer.get('SMART', 'UNSIGNED') + accumulator;
                    accumulator = lastC;
                    rsModel.faceIndicesA[i] = lastA;
                    rsModel.faceIndicesB[i] = lastB;
                    rsModel.faceIndicesC[i] = lastC;
                    break;
                case 3:
                    lastA = lastC;
                    lastC = vertexDirectionOffsetBuffer.get('SMART', 'UNSIGNED') + accumulator;
                    accumulator = lastC;
                    rsModel.faceIndicesA[i] = lastA;
                    rsModel.faceIndicesB[i] = lastB;
                    rsModel.faceIndicesC[i] = lastC;
                    break;
                case 4:
                    const oldTrianglePointOffsetX = lastA;
                    lastA = lastB;
                    lastB = oldTrianglePointOffsetX;
                    lastC = vertexDirectionOffsetBuffer.get('SMART', 'UNSIGNED') + accumulator;
                    accumulator = lastC;
                    rsModel.faceIndicesA[i] = lastA;
                    rsModel.faceIndicesB[i] = lastB;
                    rsModel.faceIndicesC[i] = lastC;
                    break;
            }
        }
        vertexDirectionOffsetBuffer.readerIndex = faceMappingsOffset;
        for (let i = 0; i < rsModel.texturedFaceCount; i++) {
            rsModel.texturedFaceIndicesA[i] = vertexDirectionOffsetBuffer.get('SHORT', 'UNSIGNED');
            rsModel.texturedFaceIndicesB[i] = vertexDirectionOffsetBuffer.get('SHORT', 'UNSIGNED');
            rsModel.texturedFaceIndicesC[i] = vertexDirectionOffsetBuffer.get('SHORT', 'UNSIGNED');
        }
        return rsModel;
    }

}
