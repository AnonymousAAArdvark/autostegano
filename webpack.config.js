const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");

module.exports = {
  stats: { children: true },
  entry: {
    main: "./src/main-app/index.tsx",
  },
  devtool: "source-map",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },],
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json", ".css"],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { context: "node_modules/rc-slider/assets", from: "index.css"},
        { context: "public", from: "**/*" },
      ],
    }),
  ],
  experiments: {
    // this option is deprecated in favor of 'asyncWebAssembly', but unfortunately
    // 'asyncWebAssembly' doesn't work because of https://github.com/rustwasm/wasm-bindgen/issues/2343
    syncWebAssembly: true,
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
};
