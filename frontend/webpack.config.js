const path = require("path");

module.exports = {
    mode: process.env.NODE_ENV || "development",
    target: "web",
    entry: {
        app: path.resolve(__dirname, "src/client/app.ts"),
        project: path.resolve(__dirname, "src/client/project.ts"),
        login: path.resolve(__dirname, "src/client/login.ts"),
    },
    output: {
        filename: ({ chunk }) => `${chunk.name}/${chunk.name}.bundle.js`,
        path: path.resolve(__dirname, "public"),
    },
    devServer: {
        compress: true,
        port: 9000,
        open: true,
        hot: true,
        historyApiFallback: true,
        proxy: [
            {
                context: () => true,
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false
            }
        ]
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
