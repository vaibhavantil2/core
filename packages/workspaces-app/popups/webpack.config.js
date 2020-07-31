const path = require("path");

module.exports = {
    mode: "development",
    entry: ["./popups/index.js","./popups/lib/web.umd.js","./popups/lib/workspaces.umd.js"],
    output: {
        filename: "popups.js",
        path: path.resolve(__dirname, './dist')
    },
    target: "web"
}