import { ConcatSource } from 'webpack-sources';
export default class InterceptWebpackPlugin {
    constructor(callback) {
        this.callback = callback;
    }
    apply(compiler) {
        const callback = this.callback;
        compiler.hooks.compilation.tap('InterceptPlugin', function (compilation) {
            compilation.moduleTemplates.javascript.hooks.render.tap('InterceptPlugin', function (moduleSource) {
                console.log(moduleSource);
                const result = new ConcatSource();
                result.add(`
if (typeof __webpack_require__ !== 'undefined') {
  __webpack_require__ = (function (o) {
    var cb = ${callback.toString()}
    var i = function(q) {
      return cb(q, o)
    }
    Object.assign(i, o);
    return i;
  })(__webpack_require__);
}
`);
                result.add(moduleSource);
                return result;
            });
        });
    }
}
//# sourceMappingURL=index.js.map