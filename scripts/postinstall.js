
var fs = require('fs');
var path = require('path');

var join = path.join;
var isDir = fs.existsSync || path.existsSync;

var logStaticPath = join(process.env.HOME, '.log-timeline');

if(!isDir(logStaticPath)) {

  fs.mkdirSync(logStaticPath);
}

var basePath = join(__dirname, '../public');

var files = fs.readdirSync(basePath);

console.log(files, basePath);

files.forEach(function(file) {

  fs.renameSync(join(basePath, file), join(logStaticPath, file));
})
