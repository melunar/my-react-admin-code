'use strict';

var path = require('path');
// var webpack = require('webpack');
// let externals = _externals();
const rootPath = './src'
// const rootPath = './build'
console.log('__dirname', __dirname)
module.exports = {
    mode: 'production',
    entry: rootPath + '/index.ts',
    // externals: externals,
    target: 'node',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'index.js'
    },
    node: {
        __dirname: true
    },
    module: {
        rules: [
            {
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env', {
                            "targets": {
                                "node": true
                            }
                        }]]
                    }
                },
                test: /\.js$/,
                exclude: /node_modules/
            },
            {
              test: /\.ts?$/,
              use: 'ts-loader',
              exclude: /node_modules/,
            },
        ]
    },
    optimization: {
        minimize: true
    },
    resolve: {
      extensions: ['.js', '.json', '.ts'],
      alias: {
        '@': path.resolve(__dirname, rootPath),
      },
    }
};

// function _externals() {
//     let manifest = require('./package.json');
//     let dependencies = manifest.dependencies;
//     let externals = {};
//     for (let p in dependencies) {
//         externals[p] = 'commonjs ' + p;
//     }
//     return externals;
// }