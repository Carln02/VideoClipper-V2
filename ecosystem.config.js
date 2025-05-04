module.exports = {
    apps: [
        {
            name: "videoclipper",
            script: "backend/dist/index.js",
            watch: false,
            env: {
                NODE_ENV: "production",
                PORT: 3000
            }
        }
    ]
};
