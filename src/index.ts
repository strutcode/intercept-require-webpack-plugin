import { Compiler, compilation, Template } from 'webpack'
import { ConcatSource } from 'webpack-sources'

export interface InterceptContext {
  query: string
  resource: string
  issuer: string
}

export type InterceptFunction = (
  context: InterceptContext,
  original: (query: string) => any,
) => any

class MainTemplatePlugin {
  apply(mainTemplate: compilation.MainTemplate, callback: Function) {
    // @ts-ignore
    mainTemplate.hooks.require.tap('InterceptRequirePlugin', function (source) {
      return Template.asString([
        'function original(moduleId) {',
        Template.indent(source),
        '};',
        'var ctx = {',
        Template.indent([
          'query: moduleId,',
          'module: this.module,',
          'issuer: this.issuer,',
          'modules: modules,',
          'loaded: installedModules,',
        ]),
        '};',
        'return (',
        Template.indent(callback.toString()),
        ')(ctx, original);',
      ])
    })
  }
}

class ModuleTemplatePlugin {
  apply(moduleTemplate: compilation.ModuleTemplate) {
    moduleTemplate.hooks.render.tap('InterceptRequirePlugin', function (
      moduleSource,
      moduleObj,
    ) {
      if (!moduleObj.dependencies.length) {
        return moduleSource
      }

      const result = new ConcatSource()

      const moduleName = JSON.stringify(moduleObj?.resource)
      const issuerName = JSON.stringify(moduleObj?.issuer?.resource)

      result.add(
        Template.asString([
          `__webpack_require__.module = ${moduleName};`,
          `__webpack_require__.issuer = ${issuerName};`,
        ]),
      )

      result.add(moduleSource)

      return result
    })
  }
}

export default class InterceptRequireWebpackPlugin {
  constructor(private callback: InterceptFunction) {}

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap('InterceptRequirePlugin', (compilation) => {
      new MainTemplatePlugin().apply(compilation.mainTemplate, this.callback)
      new ModuleTemplatePlugin().apply(compilation.moduleTemplates.javascript)
    })
  }
}

if (module) {
  module.exports = InterceptRequireWebpackPlugin
}
