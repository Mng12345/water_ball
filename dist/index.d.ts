declare namespace waterball {
    interface Controller {
        destroy(): void;
    }
    type Options = {
        frontWaveColor?: string;
        bgWaveColor?: string;
        waveHeightRatio?: number;
        waveSpeed?: number;
        containerWidth: number;
        containerHeight: number;
        borderColor?: string;
        radiusBound?: [min: number, max: number];
        xForce?: 'center' | ((nodeIndex: number) => number);
        yForce?: 'center' | ((nodeIndex: number) => number);
    };
    type Data = {
        value: number;
        label: string;
    };
    function init(container: Element, points: Data[]): Controller;
    function init(container: Element, points: Data[], options: Options, valueFormat?: (value: number) => string, labelFormat?: (label: string) => string): Controller;
}
export default waterball;
