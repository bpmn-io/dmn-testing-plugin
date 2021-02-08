/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

const path = require('path');
const { DefinePlugin } = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

const DIST_DIR = path.resolve(__dirname, 'dist');

module.exports = [
  {
    mode: 'development',
    entry: './client/index.js',
    output: {
      path: DIST_DIR,
      filename: 'client.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react'],
              plugins: ['@babel/plugin-proposal-class-properties']
            }
          }
        }
      ]
    },
    resolve: {
      alias: {
        react: 'camunda-modeler-plugin-helpers/react'
      }
    },
    devtool: 'cheap-module-source-map'
  },
  {
    mode: 'development',
    entry: './backend/main.js',
    target: 'node',
    node: {
      __dirname: false
    },
    output: {
      path: DIST_DIR,
      filename: 'main.js',
      libraryTarget: 'commonjs2'
    },

    plugins: [
      new CopyPlugin({
        patterns: [
          { from: path.resolve(__dirname, 'backend/camunda/artefacts'), to: DIST_DIR }
        ]
      }),
      new DefinePlugin({
        'process.env.CAMUNDA_PATH': "path.resolve(__dirname, 'camundaDmnTestServer.jar')"
      })
    ],
    devtool: 'cheap-module-source-map'
  }
];
