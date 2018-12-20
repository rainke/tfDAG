const config = {
  // baseUrl:'/editdag/',
  devServer: {
    proxy: {
      '/api': {
        // target: 'http://192.168.186.129:8080'
        target: 'http://10.133.0.31:12345'
      }
    }
  }
};

if (process.env.NODE_ENV === 'production') {
  config.pages = {
    index: {
      entry: 'src/main.ts',
      template: 'public/index_prd.html',
      filename: 'edit_dag.html'
    }
  };
  config.chainWebpack = config => {
    if (config.plugins.has('extract-css')) {
      const extractCSSPlugin = config.plugin('extract-css');
      extractCSSPlugin &&
        extractCSSPlugin.tap(() => [
          {
            filename: 'css/[name].css',
            chunkFilename: 'css/[name].css'
          }
        ]);
    }
  };
  config.configureWebpack = {
    output: {
      filename: 'js/[name].js',
      chunkFilename: 'js/[name].js'
    }
  };
}
module.exports = config;
