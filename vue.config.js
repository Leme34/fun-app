module.exports = {
  // 禁止build时生成map
  productionSourceMap: false,
  css: {
    loaderOptions: {
      // 构建sass全局变量
      sass: {
        data: `@import "@/common/scss/mixin.scss";`
      }
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: process.env.PROXY_API_URL, // 对应自己的接口
        // changeOrigin: true,
        // ws: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
};
