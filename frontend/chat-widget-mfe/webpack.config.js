const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/webpack');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/index.ts',
  output: {
    publicPath: isProduction 
      ? 'https://cdn.your-domain.com/chat-widget/' 
      : 'http://localhost:3002/',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'chatWidgetMFE',
      filename: 'remoteEntry.js',
      exposes: {
        './ChatWidget': './src/components/ChatWidget',
        './NavigationHelper': './src/components/NavigationHelper',
        './ConversationProvider': './src/providers/ConversationProvider',
        './useConversation': './src/hooks/useConversation',
      },
      shared: {
        react: { 
          singleton: true, 
          requiredVersion: '^18.2.0',
          eager: false,
        },
        'react-dom': { 
          singleton: true, 
          requiredVersion: '^18.2.0',
          eager: false,
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'Chat Widget MFE',
    }),
  ],
  devServer: {
    port: 3002,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    hot: true,
    liveReload: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  devtool: isProduction ? 'source-map' : 'eval-source-map',
};
