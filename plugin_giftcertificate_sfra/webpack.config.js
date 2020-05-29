var path = require('path');
var ExtractTextPlugin = require('sgmf-scripts')['extract-text-webpack-plugin'];
var sgmfScripts = require('sgmf-scripts');

module.exports = [{
	mode: 'production',
	name: 'js',
	entry: sgmfScripts.createJsPath(),
	devtool: 'source-map',
	output: {
		path: path.resolve('./cartridges/plugin_giftcertificate/cartridge/static'),
		filename: '[name].js'
	},
	resolve: {
		alias: {
			jquery: path.resolve(__dirname, '../storefront-reference-architecture/node_modules/jquery'),
			bootstrap: path.resolve(__dirname, '../storefront-reference-architecture/node_modules/bootstrap'),
			lodash: path.resolve(__dirname, '../storefront-reference-architecture/node_modules/lodash')
		}
	}
}, {
	mode: 'none',
	name: 'scss',
	entry: sgmfScripts.createScssPath(),
	output: {
		path: path.resolve('./cartridges/plugin_giftcertificate/cartridge/static'),
		filename: '[name].css'
	},
	module: {
		rules: [{
			test: /\.scss$/,
			use: ExtractTextPlugin.extract({
				use: [{
					loader: 'css-loader',
					options: {
						url: false
					}
				}, {
					loader: 'postcss-loader',
					options: {
						plugins: [
							require('autoprefixer')()
						]
					}
				}, {
					loader: 'sass-loader',
					options: {
						includePaths: [
							path.resolve('../storefront-reference-architecture/node_modules'),
							path.resolve('../storefront-reference-architecture/node_modules/flag-icon-css/sass')
						]
					}
				}]
			})
		}]
	},
	plugins: [
		new ExtractTextPlugin({ filename: '[name].css' })
	]
}];
