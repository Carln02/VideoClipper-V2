const path = require("path");

module.exports = [
    {
        mode: "development",
        target: "web",
        entry: "./src/client/app/index.ts",
        output: {
            filename: "bundle.js",
            path: path.resolve(__dirname, "public"),
        },
        devServer: {
            static: {
                directory: path.join(__dirname, "public"),
            },
            compress: true,
            port: 9000,
            open: true,
            hot: true
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: {
                                module: "ESNext",
                                target: "ES6"
                            }
                        }
                    },
                    exclude: [
                        /node_modules/,
                        path.resolve(__dirname, "src/client/appOld")
                    ]
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
            ],
        }
    }
];
