import { Template } from 'webpack';
class MainTemplatePlugin {
    apply(mainTemplate, callback) {
        mainTemplate.hooks.localVars.tap('InterceptRequirePlugin', function (source) {
            return Template.asString([
                source,
                '// Track require calls',
                'var requireStack = [];',
            ]);
        });
        // @ts-ignore
        mainTemplate.hooks.require.tap('InterceptRequirePlugin', function (source) {
            const contextualizedSource = source.replace('__webpack_require__', 'contextualize(requireStack.slice())');
            let callbackCall;
            if (typeof callback === 'string') {
                callbackCall = Template.asString([
                    `var cb = original(${JSON.stringify(callback)});`,
                    'const ret = (cb.default || cb)(ctx, original);',
                ]);
            }
            else {
                callbackCall = Template.asString([
                    'const ret = (',
                    Template.indent(callback.toString()),
                    ')(ctx, original);',
                ]);
            }
            return Template.asString([
                'function contextualize(requireStack) {',
                Template.indent([
                    'function __webpack_intercepted_require__(moduleId) {',
                    Template.indent([
                        'if (typeof moduleId === "string") requireStack.push(moduleId);',
                        'function original(moduleId) {',
                        Template.indent(contextualizedSource),
                        '};',
                        'var ctx = {',
                        Template.indent([
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
    }
}
export default class InterceptRequireWebpackPlugin {
    constructor(callback) {
        this.callback = callback;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('InterceptRequirePlugin', (compilation) => {
            new MainTemplatePlugin().apply(compilation.mainTemplate, this.callback);
        });
    }
}
if (module) {
    module.exports = InterceptRequireWebpackPlugin;
}
//# sourceMappingURL=index.js.map