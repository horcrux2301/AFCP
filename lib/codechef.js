'use babel';

import Nightmare from 'nightmare' ;
import fs from 'fs';

export function FetchDataCodechef(dir,contestCode){
  atom.notifications.addInfo('Fetching data for the contest code ' + contestCode);
  const nightmare = Nightmare({
    electronPath: require('../node_modules/electron'),
    show: false
  });
  nightmare
    .goto('https://www.codechef.com/' + contestCode)
    .wait('td.cc-problem-name')
    .evaluate(() =>
      {
        return Array.from(document.querySelectorAll('a.ember-view')).map(
          element => ({"link" : element.href, "name" : element.title})
        );
      }
    )
    .end()
    .then((data) => {
      var x = iterateProblems(data);
      x.then((data) => {
        console.log('done', data);
        createFiles(data,dir,contestCode);
      });
    })
    .catch(error => {
      console.error('Search failed:', error)
    })
}

async function iterateProblems(data) {
    for (let i = 4; i < data.length; i++) {
      const problem = data[i];
      const x = await testcases(problem);
      data[i].testCases = x;
    }
    return data;
}

function testcases(problem){
  atom.notifications.addInfo(`Fetching data for problem ${problem.name}`);
  const nightmarex = Nightmare({
    electronPath: require('../node_modules/electron'),
    show: false,
  });
  return new Promise(resolve => {
    nightmarex
      .goto(problem.link)
      .wait('b.mathjax-support')
      .evaluate(() =>
        {
          return Array.from(document.querySelectorAll('pre.mathjax-support')).map(
            element => element.innerText
          );
        }
      )
      .end()
      .then((data) => {
        // console.log("result for problem is" , problem);
        resolve(data);
      })
      .catch(error => {
        console.error('Search failed:', error)
      })
  });
}

function createFiles(data,dir, contestCode){
  fs.mkdirSync(dir + contestCode);
  for (let i = 4; i < data.length; i++){
    let problem = data[i];
    let name = problem.name;
    let cases = problem.testCases;
    fs.mkdirSync(dir + contestCode + '/' + name);
    fs.closeSync(fs.openSync(dir + contestCode + '/' + name + '/' + name + '.cpp', 'w'));
    fs.createReadStream(__dirname + '/template.cpp').pipe(fs.createWriteStream(dir + contestCode + '/' + name + '/' + name + '.cpp'));
    cases.forEach((el,i) => {
      let caseHere = el.replace(/<br>/g, "\n");
      let casex = cleanmyData(caseHere);
      fs.appendFileSync(dir + contestCode + '/' + name + '/input' + i +'.txt', casex.input);
      fs.appendFileSync(dir + contestCode + '/' + name + '/output' + i +'.txt', casex.output);
    });
  };
}

function cleanmyData(casex){
  let ind1 = casex.indexOf("Input");
  let ind2 = casex.indexOf("Output");
  ind1+=5;
  while(casex[ind1]===' ')
    ind1+=1;
  let input = casex.substring(ind1+2,ind2);
  ind2+=7;
  while(casex[ind2]===' ')
    ind2+=1;
  let output = casex.substring(ind2+1,casex.length);
  let a = {};
  a.input = input;
  a.output = output;
  // console.log(a);
  return a;
}
