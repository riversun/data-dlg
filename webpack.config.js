const packageJson = require('./package.json');
const version = packageJson.version;
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AutoPrefixer = require('autoprefixer');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {

  const conf = {
    mode: 'development',
    devServer: {
      open: true,
      openPage: 'index.html',
      contentBase: path.join(__dirname, 'public'),
      watchContentBase: true,
      port: 3000,
      host: 'localhost',
      disableHostCheck: true,
    },
    entry: {
      'demo': ['./src_demo/index.js'],
      'data-dlg': ['./src/dialog-manager.js'],
    },
    output: {
      path: path.join(__dirname, 'lib'),
      publicPath: '/',
      filename: argv.mode === 'production' ? `[name].js` : `[name].js`,
      library: 'Bootstrap4DialogHelper',
      libraryExport: 'default',
      libraryTarget: 'umd',//for both browser and node.js
      globalObject: 'this',//for both browser and node.js
      umdNamedDefine: true,
      auxiliaryComment: {
        root: 'for Root',
        commonjs: 'for CommonJS environment',
        commonjs2: 'for CommonJS2 environment',
        amd: 'for AMD environment',
      }
    },

    optimization: {
      minimizer: [new TerserPlugin({
        //extractComments: true,
        //cache: true,
        //parallel: true,
        //sourceMap: true,
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
        extractComments: false,

      })],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            {
              loader: 'babel-loader',
            },
            // {
            //   loader: 'eslint-loader',
            // },
          ],
        },
        //scss
        {
          //test: /\.(sa|sc|c)ss$/,
          test: /\.(sa|sc)ss$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: process.env.NODE_ENV === 'development',
              },
            },
            {
              loader: 'css-loader',
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  AutoPrefixer(
                    {
                      grid: 'autoplace'
                    },
                  ),
                ],
              },
            },
            {
              loader: 'sass-loader',
            }
          ],
        },
        //css
        {
          test: /\.css$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' },
          ]
        },
        {
          test: /\.(png|jpg|gif)$/i,
          use: [
            { loader: 'url-loader' },
          ]
        },
      ],
    },
    resolve: {
      alias: {}
    },
    plugins: [
      new webpack.BannerPlugin(`[name] v${version} Copyright (c) 2020 Supert`),
      new MiniCssExtractPlugin({
        filename: argv.mode === 'production' ? `[name].css` : `[name].css`,  //`[name].min.js`
      }),
    ],
  };

  if (argv.mode !== 'production') {
    conf.devtool = 'inline-source-map';
  }

  return conf;

};
