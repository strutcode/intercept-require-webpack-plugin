import { Compiler } from 'webpack';
export interface InterceptContext {
    query: string;
    request: string;
    issuer: string;
}
export declare type InterceptFunction = (context: InterceptContext, original: (query: string) => any) => any;
export default class InterceptRequireWebpackPlugin {
    private callback;
    constructor(callback: InterceptFunction);
    apply(compiler: Compiler): void;
}
