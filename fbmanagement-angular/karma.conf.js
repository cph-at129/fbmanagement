module.exports = function(config) {
  var testWebpackConfig = require('./webpack.test.js')({env: 'test'});

  var configuration = {

    // base path that will be used to resolve all patterns (e.g. files, exclude)
    basePath: '',
    frameworks: ['jasmine'],
    exclude: [ ],
    files: [ { pattern: './config/karma-test-shim.js', watched: false } ],
    //available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: { './config/karma-test-shim.js': ['coverage', 'webpack', 'sourcemap'] },
    webpack: testWebpackConfig,
    coverageReporter: {
      type: 'in-memory'
    },
    remapCoverageReporter: {
      'text-summary': null,
      json: './coverage/coverage.json',
      html: './coverage/html'
    },
    webpackMiddleware: { stats: 'errors-only'},
    //available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [ 'mocha', 'coverage', 'remap-coverage' ],
    port: 9876,
    colors: true,
    logLevel: 'debug',
    autoWatch: true,
    browsers: [
      'Chrome'
    ],
    restartOnFileChange: true
  };

  config.set(configuration);
};
