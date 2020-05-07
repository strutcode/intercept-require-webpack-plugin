import { Compiler } from 'webpack';
export interface InterceptContext {
    query: string;
    resource: string;
    issuer: string;
}
export declare type InterceptFunction = (context: InterceptContext, original: (query: string) => any) => any;
export declare type InterceptItentifier = string | InterceptFunction;
export default class InterceptRequireWebpackPlugin {
    private callback;
    constructor(callback: InterceptItentifier);
    apply(compiler: Compiler): void;
}
