// const { defineConfig } = require('@vue/cli-service')
// const webpack = require("webpack");
// module.exports = defineConfig({
//   transpileDependencies: true
// })

const PRECACHE_ASSETS_TOKEN = 'self.__PRECACHE_ASSETS__'

class InjectPrecacheAssetsPlugin {
  apply(compiler) {
    const { Compilation, sources } = compiler.webpack

    compiler.hooks.thisCompilation.tap('InjectPrecacheAssetsPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'InjectPrecacheAssetsPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
        },
        assets => {
          const swAsset = assets['sw.js']
          if (!swAsset) return

          const precacheAssets = [
            './',
            ...Object.keys(assets)
              .filter(name => name !== 'sw.js' && !name.endsWith('.map'))
              .sort()
              .map(name => `./${name}`)
          ]

          const source = swAsset.source().toString()
          const nextSource = source.replace(
            PRECACHE_ASSETS_TOKEN,
            JSON.stringify(precacheAssets, null, 2)
          )

          compilation.updateAsset('sw.js', new sources.RawSource(nextSource))
        }
      )
    })
  }
}

module.exports = {
  publicPath:"/mahjong-vue-PWA/",
  configureWebpack: {
    plugins: [
      new InjectPrecacheAssetsPlugin()
    ]
  },
  chainWebpack: config=>{
    config.plugin('html').
    tap(args => {
      args[0].title =  "在线日麻工具"
      return args
    })
  }
}
