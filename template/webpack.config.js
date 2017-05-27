'use strict';

var path = require('path');
var glob = require('glob');
var _ = require('lodash');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var packageJson = require('./package.json');

var scriptArg = process.env.npm_config_argv && JSON.parse(process.env.npm_config_argv);

var env = process.env.NODE_ENV || 'development';
if (process.argv && process.argv[2] === '--vg') {
    var cssEnv = process.argv.splice(3)[0].substr(2).replace(' ');
    process.env.CSS_ENV = cssEnv;
}

var originInput = scriptArg ? scriptArg.original : [];
var isNpmRunDev = (function () {
    return originInput && originInput.indexOf('dev') >= 0;
})();

if (isNpmRunDev && originInput && originInput[2]) {
    process.env.CSS_ENV = originInput[2].replace(/\-/, '');
}

var pltStyle = process.env.CSS_ENV || (
        packageJson['platform-style'] ? packageJson['platform-style'].split(',')[0] : 'default'
    );
console.log('CSS_ENV "' + pltStyle + '" packing .');

var ncp = require('ncp').ncp;
ncp.limit = 32;

var js = glob.sync('./src/**/*.js').reduce(function (prev, curr) {
    prev[curr.slice(6, -3)] = [curr];
    return prev;
}, {});

js = _.extend(glob.sync('./example/*.js').reduce(function (prev, curr) {
    prev[curr.slice(10, -3)] = [curr];
    return prev;
}, {}) ,js)

var baseLoaders = [
    'css',
    'postcss',
    'px2rem?baseDpr=1&remUnit=50'
];

var cssLoaders = function (options) {
    options = options || {};
    // generate loader string to be used with extract text plugin
    function generateLoaders (loaders) {
        var sourceLoader = loaders.map(function (loader) {
            var extraParamChar;
            if (/\?/.test(loader)) {
                loader = loader.replace(/\?/, '-loader?');
                extraParamChar = '&';
            } else {
                loader = loader + '-loader';
                extraParamChar = '?';
            }
            return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '');
        }).join('!');
        return ['vue-style-loader', sourceLoader].join('!');
    }

    // http://vuejs.github.io/vue-loader/configurations/extract-css.html
    return {
        css: generateLoaders(baseLoaders.concat([])),
        scss: generateLoaders(baseLoaders.concat(['sass']))
    };
};

var styleLoaders = function (options) {
    var output = [];
    var loaders = cssLoaders(options);
    for (var extension in loaders) {
        var loader = loaders[extension];
        output.push({
            test: new RegExp('\\.' + extension + '$'),
            loader: loader
        });
    }
    return output;
};

var isGallary = packageJson['vue-type'] === 'vue-gallary';

var html = glob.sync('./example/*.html').map(function (item) {
    var htmlName = isGallary && !isNpmRunDev && env !== 'development' ?
            packageJson.version + '_' + item.substr(10) : item.substr(10);

    return new HtmlWebpackPlugin({
        data: {
            env: env
        },
        filename: htmlName,
        template: 'ejs-compiled!' + item,
        inject: false,
        minify: (env === 'production' && {
            removeComments: true,
            collapseWhitespace: true,
            preserveLineBreaks: true,
            collapseInlineTagWhitespace: true,
            collapseBooleanAttributes: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            caseSensitive: true,
            minifyJS: true,
            minifyCSS: true,
            quoteCharacter: '"'
        })
    });
});

var vueLoaders = cssLoaders({sourceMap: true});
vueLoaders['js'] = 'babel?presets[]=es2015-loose';

var config = {
    entry: js,
    resolve: {
        root: [
            path.resolve('./src/modules')
        ],
        alias: {
            vue$: 'vue/dist/vue'
        }
    },
    output: {
        path: path.resolve('./build/' + pltStyle),
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: /\.vue$/,
            loader: 'vue'
        }, {
            test: /\.png$/,
            loader: 'img'
        }, {
            test: /\.js$/,
            loader: 'babel?presets[]=es2015-loose',
            exclude: /node_modules/
        }].concat(styleLoaders())
    },
    babel: {
        presets: ['es2015-loose'],
        plugins: [
            'transform-object-assign'
        ]
    },
    vue: {
        loaders: vueLoaders
    },
    postcss: [
        autoprefixer({
            browsers: ['Android >= 4', 'ChromeAndroid >= 46', 'iOS >= 8']
        })
    ],
    sassLoader: {
        includePaths: [path.resolve(__dirname, './node_modules/')]
    },
    plugins: ([
        new ProgressBarPlugin()
    ]).concat(html),
    node: {
        process: false,
        setImmediate: false
    },
    debug: false,
    bail: true
};

if (env === 'production') {
    config.plugins = config.plugins.concat([
        new webpack.DefinePlugin({
            'process.env.COMPONENT_ENV': JSON.stringify('production'),
            'process.env.NODE_ENV': JSON.stringify(env),
            'process.env.CSS_ENV': JSON.stringify(pltStyle)
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            compress: {
                pure_getters: true,
                screw_ie8: true,
                unsafe: true,
                unsafe_comps: true,
                warnings: false
            },
            output: {
                comments: false
            }
        })
    ]);
}

if (env === 'development') {
    config.debug = true;
    config.bail = false;
    config.devtool = '#cheap-module-eval-source-map';
    config.plugins = config.plugins.concat([
        new webpack.DefinePlugin({
            'process.env.COMPONENT_ENV': JSON.stringify('development'),
            'process.env.NODE_ENV': JSON.stringify(env),
            'process.env.CSS_ENV': JSON.stringify(pltStyle)
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ]);
    config.devServer = {
        host: '0.0.0.0',
        contentBase: path.resolve('./build'),
        historyApiFallback: true,
        inline: true,
        hot: true,
        stats: {
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        },
        proxy: {}
    };
    config.module.preLoaders = undefined;
}

module.exports = config;
