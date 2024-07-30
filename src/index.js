
import path from 'node:path';
import {opendir, mkdir} from 'node:fs/promises';
import {createReadStream, createWriteStream } from 'node:fs';
import { remove, copy } from 'fs-extra/esm';
import { rimraf } from 'rimraf';

const PWD = `${process.cwd()}/`;

const defaultOptions = {
  copyDir: 'copyDist'
}

export class CopyDistDeleteJsMapWebpackPlugin {
  constructor(option = {}){
    this.options = {...defaultOptions, option}
  }
  apply(compiler){
    compiler.hooks.done.tapAsync('CopyDistDeleteJsMapWebpackPlugin', (stats, callback) => {
      // webpack config output path
      const distDir = stats.compilation.outputOptions.path;
      // webpack config 配置了filename 路径
      const fileName = stats.compilation.outputOptions.filename;
      // 找到js文件输出目录
      const realJsDir = this.handleRealyJSDir(distDir, fileName)
      // copy dir path
      const copyDir = path.join(PWD, this.options.copyDir);
      this.copyOriginDir(distDir, copyDir, realJsDir, stats).then(res => {
        console.log('复制完成')
        callback()
      }).catch(err => {
        console.log(err)
        callback()
      })
    })
  }


  /**
   * @description 复制dist文件目录
   *
   * @param {*} originDir
   * @param {*} targetDir
   * @param {*} stats
   */
  async copyOriginDir(originDir, targetDir, jsDir, stats){
    try {
      // 删除已有复制目录
      await rimraf(targetDir, {}, () => {
        console.log('删除已完成')
      });
      // 新建复制目录
      await mkdir(targetDir, { recursive: true });
      // 复制
      await copy(originDir, targetDir);
      // 打开dist js 目录
      const jsFiles = await opendir(jsDir);
      for await (const file of jsFiles) {
        if(file.name.endsWith('.js.map')){
          await remove(file.path)
        }
      }
    } catch(err){
      console.log(err);
      throw err;
    }
  }


  async copyFileStream(src,dest){
    return new Promise((resolve, reject) => {
      const readStream = createReadStream(src);
      const writeStream = createWriteStream(dest);
      readStream.on('error', (err) => {
        reject(err)
        console.error(`Error reading file: ${err}`);
      });
    
      writeStream.on('error', (err) => {
        reject(err)
        console.error(`Error writing file: ${err}`);
      });
    
      readStream.pipe(writeStream)
        .on('finish', () => {
          console.log('File copied successfully.');
          resolve('File copied successfully')
        });
    })
  }

  /**
   * @description find output js dir
   *
   * @param {*} distDir base dir
   * @param {*} fileName path
   * @return {*} concat path
   */
  handleRealyJSDir (distDir, fileName){
    if(fileName.indexOf('/') === -1){
      return distDir
    }
    const reverseStr = fileName.split('').reverse().join('');
    const at = reverseStr.indexOf('/');
    const concatDir = fileName.substr(0, fileName.length - (at+1));
    return path.join(distDir, concatDir)
  }
}