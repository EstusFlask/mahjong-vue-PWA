// const { defineConfig } = require('@vue/cli-service')
// const webpack = require("webpack");
// module.exports = defineConfig({
//   transpileDependencies: true
// })

module.exports = {
  publicPath:"/mahjong-vue-PWA/",
  chainWebpack: config=>{
    config.plugin('html').
    tap(args => {
      args[0].title =  "在线日麻工具"
      return args
    })
  }
}
