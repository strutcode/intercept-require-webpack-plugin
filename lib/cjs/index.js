"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webpack_1 = require("webpack");
var MainTemplatePlugin = /** @class */ (function () {
    function MainTemplatePlugin() {
    }
    MainTemplatePlugin.prototype.apply = function (mainTemplate, callback) {
        mainTemplate.hooks.localVars.tap('InterceptRequirePlugin', function (source) {
            return webpack_1.Template.asString([
                source,
                '// Track require calls',
                'var requireStack = [];',
            ]);
        });
        // @ts-ignore
        mainTemplate.hooks.require.tap('InterceptRequirePlugin', function (source) {
            var contextualizedSource = source.replace('__webpack_require__', 'contextualize(requireStack.slice())');
            var callbackCall;
            if (typeof callback === 'string') {
                callbackCall = webpack_1.Template.asString([
                    "var cb = original(" + JSON.stringify(callback) + ");",
                    'const ret = (cb.default || cb)(ctx, original);',
                ]);
            }
            else {
                callbackCall = webpack_1.Template.asString([
                    'const ret = (',
                    webpack_1.Template.indent(callback.toString()),
                    ')(ctx, original);',
                ]);
            }
            return webpack_1.Template.asString([
                'function contextualize(requireStack) {',
                webpack_1.Template.indent([
                    'function __webpack_intercepted_require__(moduleId) {',
                    webpack_1.Template.indent([
                        'if (typeof moduleId === "string") requireStack.push(moduleId);',
                        'function original(moduleId) {',
                        webpack_1.Template.indent(contextualizedSource),
                        '};',
                        'var ctx = {',
                        webpack_1.Template.indent([
                            'query: moduleId,',
                            'parent: requireStack[requireStack.length - 2],',
                            'issuer: requireStack[requireStack.length - 3],',
                            'modules: modules,',
                            'loaded: installedModules,',
                        ]),
                        '};',
                        callbackCall,
                        'if (typeof moduleId === "string") requireStack.pop()',
                        'return ret;',
                    ]),
                    '};',
                    '',
                    'Object.assign(__webpack_intercepted_require__, __webpack_require__);',
                    '',
                    'return __webpack_intercepted_require__;',
                ]),
                '};',
                '',
                'return contextualize(requireStack)(moduleId);',
            ]);
        });
    };
    return MainTemplatePlugin;
}());
var InterceptRequireWebpackPlugin = /** @class */ (function () {
    function InterceptRequireWebpackPlugin(callback) {
        this.callback = callback;
    }
    InterceptRequireWebpackPlugin.prototype.apply = function (compiler) {
        var _this = this;
        compiler.hooks.compilation.tap('InterceptRequirePlugin', function (compilation) {
            new MainTemplatePlugin().apply(compilation.mainTemplate, _this.callback);
        });
    };
    return InterceptRequireWebpackPlugin;
}());
exports.default = InterceptRequireWebpackPlugin;
if (module) {
    module.exports = InterceptRequireWebpackPlugin;
}
//# sourceMappingURL=index.js.map