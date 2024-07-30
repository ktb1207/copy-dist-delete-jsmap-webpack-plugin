const { nodeResolve } =  require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const cleaner = require('rollup-plugin-cleaner');


module.exports = {
  input: 'src/index.js',
  output: [
    {
      format: 'cjs',
      file: 'dist/index.cjs.js'
    },
    // {
    //   format: 'umd',
    //   // 全局变量命名
    //   name: 'CPWP',
    //   exports: 'named',
    //   file: 'dist/index.umd.js',
    //   globals: {}
    // },
    {
      format: 'es',
      file: 'dist/index.esm.js'
    }
  ],
  plugins: [
    commonjs({
      include: /node_modules/
    }),
    nodeResolve(), // 添加 node-resolve 插
    cleaner({targets: ['./dist/']})
  ]
}