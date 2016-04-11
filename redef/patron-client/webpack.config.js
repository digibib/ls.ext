const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: [
    'es5-shim',
    'babel-polyfill',
    'webpack-hot-middleware/client',
    './src/frontend/main'
  ],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public/dist'),
    publicPath: '/dist/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      },
      '__DEVTOOLS__': process.env.DEVTOOLS === 'true'
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.template.html'
    })
  ],
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: [ 'style', 'css', 'sass' ],
        include: path.join(__dirname, 'src/sass')
      },
      {
        test: /\.js$/,
        loader: 'babel',
        include: path.join(__dirname, 'src/frontend')
      }
    ]
  }
}
