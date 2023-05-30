const { defineConfig } = require('@vue/cli-service')
let gateway
let cookie
gateway = ' https://show.bilibili.com/'

cookie = `你刚刚复制的cookie`
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: "localhost",
    port: 8080,
    open: true,
    proxy: {
      "/api": {
        target: "https://show.bilibili.com/",
        changeOrigin: true,
        ws: true,
        headers: {
          Cookie: cookie,
          Referer: gateway,
          Origin: gateway,
        },
      }
    },
  },
})
