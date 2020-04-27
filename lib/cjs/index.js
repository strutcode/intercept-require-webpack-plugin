"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webpack_sources_1 = require("webpack-sources");
var InterceptRequireWebpackPlugin = /** @class */ (function () {
    function InterceptRequireWebpackPlugin(callback) {
        this.callback = callback;
    }
    InterceptRequireWebpackPlugin.prototype.apply = function (compiler) {
        var callback = this.callback;
        var unindent = function (s) { return s.replace(/^\s*/m, ''); };
        compiler.hooks.compilation.tap('InterceptRequirePlugin', function (compilation) {
            compilation.moduleTemplates.javascript.hooks.render.tap('InterceptRequirePlugin', function (moduleSource, moduleObject) {
                var result = new webpack_sources_1.ConcatSource();
                result.add(unindent("\n              if (typeof __webpack_require__ !== 'undefined') {\n                __webpack_require__ = (function (o) {\n                  var cb = " + callback.toString() + "\n                  var i = function(q) {\n                    return cb({\n                      query: q,\n                      request: " + JSON.stringify(moduleObject.request) + ",\n                      issuer: " + JSON.stringify(moduleObject.issuer.request) + "\n                    }, o)\n                  }\n                  Object.assign(i, o);\n                  return i;\n                })(__webpack_require__);\n              }"));
                result.add(moduleSource);
                return result;
            });
        });
    };
    return InterceptRequireWebpackPlugin;
}());
exports.default = InterceptRequireWebpackPlugin;
if (module) {
    module.exports = InterceptRequireWebpackPlugin;
}
//# sourceMappingURL=index.js.map