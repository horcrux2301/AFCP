'use babel';
import cheerio from 'cheerio';
import fs from 'fs';
import rp from 'request-promise';

export function FetchDataAtcoder(dir, contestCode){
  atom.notifications.addInfo('Fetching data for the contest code ' + contestCode);
  let problems = [];
  let contestUrl = 'https://' + contestCode +'.contest.atcoder.jp/assignments';
  rp(contestUrl , (error,response,body) => {
    const $ = cheerio.load(body);
    $("td").each((i,el) => {
      if(i%5===0){
        let temp = {};
        temp.link = $("a",el).attr("href");
        temp.code = $(el).text();
        problems.push(temp);
      }
      else if(i%5==1){
        problems[Math.floor(i/5)].name = $(el).text();
      }
    })
  })
  .then(() => {
    baseurl1 = 'https://' + contestCode + '.contest.atcoder.jp';
    fs.mkdirSync(dir + contestCode);
    Object.keys(problems).map((problem) => {
      testcases(baseurl1+problems[problem].link, problems[problem].name,problems[problem].code, contestCode, dir);
    });

  })
  .catch((err) => {
    console.log(err);
  });
}

function testcases(url,name,code,contestCode,dir){
  rp(url, (a,b,c) => {
    const $ = cheerio.load(c);
    fs.mkdirSync(dir + contestCode + '/' + name);
    fs.closeSync(fs.openSync(dir + contestCode + '/' + name + '/' + name + '.cpp', 'w'));
    fs.createReadStream(__dirname + '/template.cpp').pipe(fs.createWriteStream(dir + contestCode + '/' + name + '/' + name + '.cpp'));
    let xyz = $("section>pre");
    let size = Object.keys(xyz).length;
    let start = 1;
    let end = size-5;
    end = Math.floor(end/2);
    $("section>pre").each((i,el) => {
      if(i>=1 && i<=end){
        let text = $(el).text();
        if(i%2===0){
          let k = Math.floor(i/2);
          fs.appendFileSync(dir + contestCode + '/' + name + '/output' + k +'.txt', text);
        }
        else{
          let k = Math.floor((i-1)/2);
          fs.appendFileSync(dir + contestCode + '/' + name + '/input' + k +'.txt', text);
        }
      }
    });
  })
  .then(() => {
    console.log('');
  });
}
