const HtmlWebpackPlugin = require("html-webpack-plugin");
const MomentTimezoneDataPlugin = require("moment-timezone-data-webpack-plugin");
const currentYear = new Date().getFullYear();
const path = require("path");

module.exports = env => {
	return {
		module: {
			rules: [
				{
					test: /\.css$/,
					use: ["style-loader", "css-loader"]
				}
			]
		},
		entry: {
			main: './src/index.js',
			timepoint: './src/timepoint.js',
		},
		output: {
			path: path.resolve(__dirname, "docs")
		},
		plugins: [
			new HtmlWebpackPlugin({
				publicPath: env.WEBPACK_BUNDLE ? "/timezone-heatmap" : "/",
				template: path.resolve(__dirname, "src", "index.html"),
				chunks: ['main'],
			}),
			new HtmlWebpackPlugin({
				publicPath: env.WEBPACK_BUNDLE ? "/timezone-heatmap/" : "/",
				template: path.resolve(__dirname, "src", "timepoint.html"),
				filename: "timepoint.html",
				chunks: ['timepoint'],
			}),
			// To keep all zones but limit data to specific years, use the year range options
			new MomentTimezoneDataPlugin({
				startYear: currentYear - 1,
				endYear: currentYear + 1
			})
		]
	};
};
