const path = require('path');
const fs = require('fs')
const {rollup} = require('rollup')
const vue = require('rollup-plugin-vue')
const babel = require('rollup-plugin-babel');
const uglify = require('uglify-js')
const CleanCSS = require('clean-css')
const sass = require('node-sass')

rollup({
  entry: 'src/index.vue',
  plugins: [
    vue({
      compileTemplate: true,
      css (styles, stylesNodes) {
        write('dist/index.scss', styles);
        sass.render({
            data: styles,
            outputStyle: 'expanded'
        }, function (err, result) {
            //   if (err) throw err
          write('dist/index.css', result ? result.css : '')
        })
      }
    }),
    babel({
        presets: [ 'es2015-loose-rollup' ]
    })
  ]
})
  .then(function (bundle) {
    var code = bundle.generate({
      format: 'umd',
      moduleName: '{{ name }}',
      useStrict: false
    }).code
    return write('dist/index.es.js', code).then(function () {
      return code
    })
  })
  .then(function (code) {
    var minified = uglify.minify(code, {
      fromString: true,
      output: {
        ascii_only: true
      }
    }).code
    return write('dist/index.min.js', minified)
  })
  .catch(logError)

function write (dest, code) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dest, code, function (err) {
      if (err) return reject(err)
      console.log(blue(dest) + ' ' + getSize(code))
      resolve()
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
