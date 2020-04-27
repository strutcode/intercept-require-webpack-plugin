import { Compiler } from 'webpack';
export default class InterceptWebpackPlugin {
    private callback;
    constructor(callback: Function);
    apply(compiler: Compiler): void;
}
