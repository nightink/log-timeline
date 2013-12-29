
/**
 * Module dependencies.
 */

var fs          = require('fs');
var path        = require('path');
var exec        = require('child_process').exec;

var moment      = require('moment');
var express     = require('express');
var program     = require('commander');
var parseString = require('xml2js').parseString;

var app         = express();


var cwd         = process.cwd();

var currYear    = moment().format('YYYY');

program
  .version(require('./package.json').version)
  .option('-p, --port [port]', '设置预览端口', Number, 4000)
  .parse(process.argv);

console.log('svn 日志签入记录生成中...');

exec('svn log --xml', {cwd: cwd}, function(err, data, stderr) {

  parseString(data, function (err, result) {
  
    if(err) {

      return;
    }

    var dataLog = [];

    result.log.logentry.forEach(function(data) {

      var sDate = moment(data.date[0]).format('YYYY,MM,DD,HH,mm,ss');

      dataLog.push({

        headline: data.author[0] + data.msg[0],
        startDate: sDate,
        message: data.msg[0]
      });
    });

    var dataStr = {
      timeline: {
        headline: 'svn log',
        type: 'default',
        startDate: currYear,
        text: '<i><span class="c1">Designed</span> by <span class="c2">CHC</span></i>',
        date: dataLog
      }
    };

    fs.writeFileSync(path.join(__dirname, 'public/data.json'), JSON.stringify(dataStr));

    console.log('svn 日志签入记录生成完毕.');

    app.use(express.static(path.join(__dirname, 'public')));
    app.set('port', program.port);

    // 启动server, 监听端口
    app.listen(app.get('port'), function(err) {

      if(err) {
        console.log(err.message);
        return;
      }
      console.log('请访问 http://localhost:%s/ 查看签入时间线', app.get('port'));
    });

  });
});