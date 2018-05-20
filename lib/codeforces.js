'use babel';
import PythonShell from 'python-shell';
import request from 'request';
import cheerio from 'cheerio';
import fs from 'fs';
import rp from 'request-promise';
import shell from 'shelljs';
import FileHound from 'filehound';

export function FetchDataCodeforces(dir, contestCode){
  atom.notifications.addInfo('Fetching data for the contest code ' + contestCode);
  let problems = [];
  rp('http://codeforces.com/contest/' + contestCode, (error,response,body) => {
    const $ = cheerio.load(body);
    $("option").each((i,el) => {
      let temp = {};
      let b = $(el).attr("value")
      let a = $(el).attr("data-problem-name");
      if(a!==undefined && a!=''){
        temp.code = b;
        temp.name = a;
        problems.push(temp);
      }
    })
  })
  .then(() => {
    baseurl1 = 'http://codeforces.com/contest/' + contestCode +'/problem/';
    fs.mkdirSync(dir + contestCode);
    Object.keys(problems).map((problem) => {
      testcases(baseurl1+problems[problem].code, problems[problem].name,contestCode, dir);
    });

  });
}

function testcases(url,name,contestCode,dir){
  rp(url, (a,b,c) => {
    const $ = cheerio.load(c);
    fs.mkdirSync(dir + contestCode + '/' + name);
    fs.closeSync(fs.openSync(dir + contestCode + '/' + name + '/' + name + '.cpp', 'w'));
    fs.createReadStream(__dirname + '/template.cpp').pipe(fs.createWriteStream(dir + contestCode + '/' + name + '/' + name + '.cpp'));
    $("div[class=\"input\"]").each((i,el) => {
      let xx = $(el).children("pre");
      let ss = xx.html();
      ss = ss.replace(/<br>/g, "\n");
      fs.appendFileSync(dir + contestCode + '/' + name + '/input' + i +'.txt', ss);
    });
    $("div[class=\"output\"]").each((i,el) => {
      let xx = $(el).children("pre");
      let ss = xx.html();
      ss = ss.replace(/<br>/g, "\n");
      fs.appendFileSync(dir + contestCode + '/' + name + '/output' + i +'.txt', ss);
    });
  })
  .then(() => {
    console.log('');
  });
}
