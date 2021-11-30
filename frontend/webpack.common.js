const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  entry: {
    app: './src/index.tsx',
    dwell: './src/dwell/chat_module/index.js',
  },
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
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
    alias: {
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
    publicPath: '/static/bundles/',
    filename: chunkData => (chunkData.chunk.name === 'dwell'
      ? '[name].js'
      : '[name].[contenthash].js'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
    new BundleTracker({ filename: './static/webpack-stats.json' }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
};
