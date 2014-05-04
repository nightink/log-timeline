
var fs = require('fs');
var path = require('path');

var join = path.join;
var isDir = fs.existsSync || path.existsSync;

var logStaticPath = join(process.env.HOME, '.log-timeline');

if(isDir(logStaticPath)) {

  fs.rmdirSync(logStaticPath);
}
