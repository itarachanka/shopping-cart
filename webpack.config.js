const webpack = require('webpack');
const pkg = require('./package.json');

module.exports = {
  devtool: 'eval-source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:5000',
    'webpack/hot/dev-server',
    './src/app'
  ],
  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.BannerPlugin([`${pkg.name} - ${pkg.description}`,
                              `@version v${pkg.version}`,
                              `@link ${pkg.homepage}`,
                              `@license ${pkg.license}`].join('\n')),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      include: /src/,
      loaders: ['babel-loader']
    }]
  }
};
