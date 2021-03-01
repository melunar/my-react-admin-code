/* eslint-disable import/newline-after-import */
/* eslint-disable import/no-commonjs */

const fs = require('fs');
const path = require('path');
const targetFile = './src/index.ts'
fs.readFile(path.join(__dirname, targetFile), 'utf8', function (err, data) {
  if (err) throw err;
  let newContent = data.replace("import 'module-alias/register'", "// import 'module-alias/register'");
  fs.writeFile(path.join(__dirname, targetFile), newContent, 'utf8', (errBiz) => {
    if (errBiz) throw errBiz;
    console.warn('....fix index.ts success');
  })
})