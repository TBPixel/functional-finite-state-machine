const path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'ffsm.js',
        library: 'ffsm',
        libraryTarget: 'commonjs2',
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                include: path.resolve(__dirname, 'src'),
                exclude: /(node_modules|build)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: ['@babel/plugin-transform-spread'],
                        },
                    },
                    {
                        loader: 'eslint-loader',
                    },
                ],
            },
        ],
    },
};
