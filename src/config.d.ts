declare namespace G {
    export interface Operator {
        op_path: string;
        op_style: string;
        op_type: string;
        op_parmas?: string[];
        op_params: string[];
    }
}

declare var globalConfig: G.Operator[];

interface Window {
    globalConfig: G.Operator[];
}
