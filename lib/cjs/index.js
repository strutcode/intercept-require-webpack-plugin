"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webpack_sources_1 = require("webpack-sources");
var InterceptWebpackPlugin = /** @class */ (function () {
    function InterceptWebpackPlugin(callback) {
        this.callback = callback;
    }
    InterceptWebpackPlugin.prototype.apply = function (compiler) {
        var callback = this.callback;
        compiler.hooks.compilation.tap('InterceptPlugin', function (compilation) {
            compilation.moduleTemplates.javascript.hooks.render.tap('InterceptPlugin', function (moduleSource) {
                console.log(moduleSource);
                var result = new webpack_sources_1.ConcatSource();
                result.add("\nif (typeof __webpack_require__ !== 'undefined') {\n  __webpack_require__ = (function (o) {\n    var cb = " + callback.toString() + "\n    var i = function(q) {\n      return cb(q, o)\n    }\n    Object.assign(i, o);\n    return i;\n  })(__webpack_require__);\n}\n");
                result.add(moduleSource);
                return result;
            });
        });
    };
    return InterceptWebpackPlugin;
}());
exports.default = InterceptWebpackPlugin;
//# sourceMappingURL=index.js.map