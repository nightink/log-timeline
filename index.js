'use strict';

/**
 * Module dependencies.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const exec = require('child_process').exec;

const dayjs = require('dayjs');
const staticServe = require('serve-static');

const cwd = process.cwd();
const currYear = dayjs(Date.now()).format('YYYY');
const isDir = fs.existsSync || path.existsSync;

module.exports = function(program) {
  console.log('Check-in log records generated...');

  function startServer(dataLog) {
    const logStaticPath = path.join(process.env.HOME, '.log-timeline');

    const options = {
      'index': 'index.html'
    };

    const dataStr = {
      timeline: {
        headline: 'log',
        type: 'default',
        startDate: currYear,
        text: '<i><span class="c1">Designed</span> by <span class="c2">nightink</span></i>',
        date: dataLog
      }
    };

    fs.writeFileSync(path.join(logStaticPath, 'data.json'), JSON.stringify(dataStr, null, 2));

    console.log('Completed generating log records checked.');

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
      console.log('Please visit http://localhost:%s/ view check-in timeline', program.port);
      exec('open http://127.0.0.1:' + program.port);
    });
  }

  function gitLog() {
    exec('git log --pretty=format:"%an|%ad|%s"', {cwd: cwd}, function(err, data, stderr) {
      if(err) {
        return console.log(err);
      }

      const dataLog = [];

      data.split('\n').forEach(function(d) {
        const _d = d.split('|');
        const sDate = dayjs(_d[1]).format('YYYY,MM,DD,HH,mm,ss');

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
    const parseString = require('xml2js').parseString;
    exec('svn log --xml', {cwd: cwd}, function(err, data, stderr) {
      if(err) {
        return console.log(err);
      }

      parseString(data, function (error, result) {
        if(error) return;

        const dataLog = [];

        result.log.logentry.forEach(function(log) {
          const sDate = dayjs(log.date[0]).format('YYYY,MM,DD,HH,mm,ss');

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

  isDir('.git') ? gitLog() : svnLog();
};
