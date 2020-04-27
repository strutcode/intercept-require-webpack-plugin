import { Compiler } from 'webpack'
import { ConcatSource } from 'webpack-sources'
import path from 'path'

export default class InterceptRequireWebpackPlugin {
  constructor(private callback: Function) {}

  apply(compiler: Compiler) {
    const callback = this.callback
    const unindent = (s: string) => s.replace(/^\s*/m, '')

    compiler.hooks.compilation.tap('InterceptRequirePlugin', function (
      compilation,
    ) {
      compilation.moduleTemplates.javascript.hooks.render.tap(
        'InterceptRequirePlugin',
        function (moduleSource, moduleObject) {
          const result = new ConcatSource()
          const context = moduleObject.context

          result.add(
            unindent(
              `
              if (typeof __webpack_require__ !== 'undefined') {
                __webpack_require__ = (function (o) {
                  var cb = ${callback.toString()}
                  var i = function(q) {
                    return cb(q, ${JSON.stringify(context)}, o)
                  }
                  Object.assign(i, o);
                  return i;
                })(__webpack_require__);
              }`,
            ),
          )

          result.add(moduleSource)

          return result
        },
      )
    })
  }
}
