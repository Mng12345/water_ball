/**
 * This file is cloned and modified from repo waterwaves
 * https://github.com/acdseen/waterWaves.git
 */
type Options = {
    cW: number;
    cH: number;
    baseY: number;
    nowRange: number;
    oneColor: string;
    twoColor: string;
    lineColor: string;
};
export interface WaterPolo {
    destroy: () => void;
}
export declare function newWaterPolo(canvas: HTMLCanvasElement, options: Options): WaterPolo | undefined;
export {};
