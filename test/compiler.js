const del = require("del");
const path = require("path");
const MemoryFS = require("memory-fs");

const webpack = require("webpack");
const { version } = require("webpack/package.json");

const mode = config => {
    if (Number(version[0]) >= 4) {
        config.mode = config.mode || "development";
    }

    return config;
};

const optimize = config => {
    if (Number(version[0]) >= 4) {
        config.optimization = config.optimization || {
            namedChunks: true,
            namedModules: true,
            runtimeChunk: true,
            occurrenceOrder: true,
        };
    }

    return config;
};

const modules = config => {
    return {
        rules: config.rules
            ? config.rules
            : config.loader
            ? [
                  {
                      test: config.loader.test || /\.enc$/,
                      use: [
                          { loader: "raw-loader" },
                          {
                              loader: path.resolve(process.cwd()),
                              options: config.loader.options || {},
                          },
                      ],
                  },
              ]
            : [],
    };
};

const plugins = config =>
    [
        Number(version[0]) >= 4
            ? false
            : new webpack.optimize.CommonsChunkPlugin({
                  names: ["runtime"],
                  minChunks: Infinity,
              }),
    ]
        .concat(config.plugins || [])
        .filter(Boolean);

const output = config => {
    return {
        path: path.resolve(
            process.cwd(),
            `test/outputs/${config.output ? config.output : ""}`,
        ),
        // publicPath: 'assets/',
        filename: "[name].js",
        chunkFilename: "[name].js",
    };
};

module.exports = function(fixture, config, options) {
    // Compiler Config
    config = {
        devtool: config.devtool || false,
        context: config.context || path.resolve(process.cwd(), "test"),
        entry: config.entry || `./${fixture}`,
        output: output(config),
        module: modules(config),
        plugins: plugins(config),
    };

    // Compiler Mode
    config = mode(config);

    // Compiler Optimizations
    config = optimize(config);

    // Compiler Options
    options = Object.assign({ output: false }, options);

    if (options.output) {
        del.sync(config.output.path);
    }

    const compiler = webpack(config);

    if (!options.output) {
        compiler.outputFileSystem = new MemoryFS();
    }

    return new Promise((resolve, reject) =>
        compiler.run((err, stats) => {
            if (err) reject(err);

            resolve(stats);
        }),
    );
};
