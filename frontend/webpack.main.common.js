const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/main_page/index.tsx',
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|jsx|ts|tsx)$/,
        include: path.join(__dirname, 'src'),
        exclude: /[\\/]node_modules[\\/]/,
        loader: 'eslint-loader',
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.join(__dirname, 'tsconfig.json'),
            },
          },
        ],
      },
      {
        test: /\.(jpe?g|gif|png|eot|svg|woff2|woff|ttf)$/,
        loader: 'file-loader?name=public/fonts/[name].[ext]',
      },
      {
        test: /\.mp3$/,
        include: path.join(__dirname, 'src/assets/audio/'),
        loader: 'file-loader',
      },
      {
        test: /\.(sass|scss|css)$/,
        use: [
          {
            loader: 'style-loader', // creates style nodes from JS strings
          },
          {
            loader: 'css-loader', // translates CSS into CommonJS
          },
          {
            loader: 'sass-loader', // compiles Sass to CSS
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
    alias: {
      './dist/cpexcel.js': '',
      src: path.resolve(__dirname, 'src'),
      dwell: path.resolve(__dirname, 'src/dwell'),
      site: path.resolve(__dirname, 'src/site'),
      compete: path.resolve(__dirname, 'src/compete'),
      containers: path.resolve(__dirname, 'src/containers/'),
      store: path.resolve(__dirname, 'src/store/'),
      fusioncharts: path.resolve(__dirname, 'fusioncharts-xt-ol/js/'),
      styles: path.resolve(__dirname, 'src/styles/'),
      main_page: path.resolve(__dirname, 'src/main_page'),
      images: path.resolve(__dirname, 'static/images'),
    },
  },
  output: {
    path: `${__dirname}/static/bundles/`,
    publicPath: process.env.MAIN_PAGE_HOST || 'http://localhost:8080/',
    filename: '[name].[contenthash].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Dwell',
      template: './src/main_page/index.html',
      crmHost: process.env.CRM_HOST || 'http://localhost:8000',
    }),
    new CopyPlugin([
      { from: path.resolve(__dirname, 'src/main_page/robots.txt'),
        to: path.resolve(__dirname, 'static/bundles/robots.txt') },
    ]),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
  ],
  devServer: {
    disableHostCheck: true,
  },
};
