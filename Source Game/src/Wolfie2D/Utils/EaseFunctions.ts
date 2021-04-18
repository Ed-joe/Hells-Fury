// @ignorePage

export default class EaseFunctions {

    static easeInOutSine(x: number): number {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    }

    static easeOutInSine(x: number): number {
        return x < 0.5 ? -Math.cos(Math.PI*(x + 0.5))/2 : -Math.cos(Math.PI*(x - 0.5))/2 + 1;
    }

    static easeOutSine(x: number): number {
        return Math.sin((x * Math.PI) / 2);
    }

    static easeInSine(x: number): number {
        return 1 - Math.cos((x * Math.PI) / 2); 
    }

    static easeInOutQuint(x: number): number {
        return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;    
    }

    static easeInOutQuad(x: number): number {
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }

    static easeOutInQuad(x: number): number {
        return x < 0.5 ? this.easeOutIn_OutPow(x, 2) : this.easeOutIn_InPow(x, 2);
    }

    private static easeOutIn_OutPow(x: number, pow: number): number {
        return 0.5 - Math.pow(-2 * x + 1, pow) / 2;
    }

    private static easeOutIn_InPow(x: number, pow: number): number {
        return 0.5 + Math.pow(2 * x - 1, pow) / 2;
    }
}

export enum EaseFunctionType {
    // SINE
    IN_OUT_SINE = "easeInOutSine",
    OUT_IN_SINE = "easeOutInSine",
    IN_SINE = "easeInSine",
    OUT_SINE = "easeOutSine",

    // QUAD
    IN_OUT_QUAD = "easeInOutQuad",
    OUT_IN_QUAD = "easeOutInQuad",

    // QUINT
    IN_OUT_QUINT = "easeInOutQuint"
}