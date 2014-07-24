#!/usr/bin/env node

/**
 * Module dependencies.
 */

var fs          = require('fs');
var path        = require('path');
var http        = require('http');
var exec        = require('child_process').exec;

var moment      = require('moment');
var staticServe = require('serve-static');
var program     = require('commander');
var parseString = require('xml2js').parseString;

var cwd         = process.cwd();
var currYear    = moment().format('YYYY');
var isDir       = fs.existsSync || path.existsSync;

var logStaticPath = path.join(process.env.HOME, '.log-timeline');

program
  .option('-p, --port [port]', '设置预览端口', Number, 4000)
  .version(require('./package.json').version)
  .parse(process.argv);

console.log('日志签入记录生成中...');

function gitLog() {

  exec('git log --pretty=format:"%an|%ad|%s"', {cwd: cwd}, function(err, data, stderr) {

    if(err) {

      return console.log(err);
    }

    var dataLog = [];

    data.split('\n').forEach(function(d) {

      var _d = d.split('|');

      var sDate = moment(_d[1]).format('YYYY,MM,DD,HH,mm,ss');

      dataLog.push({

        headline: _d[0] + ' ' + _d[2],
        startDate: sDate,
        message: _d[2]
      });
    });

    startServer(dataLog);
  });
}

function svnLog() {

  exec('svn log --xml', {cwd: cwd}, function(err, data, stderr) {

    if(err) {

      return console.log(err);
    }

    parseString(data, function (error, result) {

      if(error) {

        return;
      }

      var dataLog = [];

      result.log.logentry.forEach(function(log) {

        var sDate = moment(log.date[0]).format('YYYY,MM,DD,HH,mm,ss');

        dataLog.push({

          headline: log.author[0] + log.msg[0],
          startDate: sDate,
          message: log.msg[0]
        });
      });

      startServer(dataLog);
    });
  });
}

function startServer(dataLog) {

  var dataStr = {
    timeline: {
      headline: 'log',
      type: 'default',
      startDate: currYear,
      text: '<i><span class="c1">Designed</span> by <span class="c2">Nightink</span></i>',
      date: dataLog
    }
  };

  fs.writeFileSync(path.join(logStaticPath, 'data.json'), JSON.stringify(dataStr, null, 2));

  console.log('日志签入记录生成完毕.');

  var options = {
    'index': 'index.html'
  }

  http.createServer(function(req, res){

    staticServe(logStaticPath, options)(req, res, function(err) {

      if(!err) {

        res.end('<h2>404: not found</h2>');
      }
    });
  }).listen(program.port, function(err) {

    if(err) {
      console.log(err.message);
      return;
    }
    console.log('请访问 http://localhost:%s/ 查看签入时间线', program.port);
    exec('open http://127.0.0.1:' + program.port);
  });
}

isDir('.git') ?
  gitLog() :
  svnLog();
