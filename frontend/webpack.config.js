const path = require("path");

module.exports = {
    mode: process.env.NODE_ENV || "development",
    target: "web",
    entry: path.resolve(__dirname, "src/client/index.ts"), // ✅ resolves full path
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "bundle.js"
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, "public")
        },
        compress: true,
        port: 9000,
        open: true,
        hot: true,
        historyApiFallback: true,
        proxy: [{
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
                credentials: 'include',
            }
        }]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        compilerOptions: {
                            configFile: path.resolve(__dirname, "tsconfig.json")
                        }
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    devtool: "source-map"
};
