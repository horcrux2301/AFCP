'use babel';

import CpAutomationView from './cp-automation-view';
import { CompositeDisposable } from 'atom';
import PythonShell from 'python-shell';
import request from 'request';
import cheerio from 'cheerio';
import fs from 'fs';
import rp from 'request-promise';
import shell from 'shelljs';
import FileHound from 'filehound';
const exec = require('child_process').exec;

export default {

  cpAutomationView: null,
  modalPanel: null,
  subscriptions: null,

  "config": {
    "directory": {
      "type": "string",
      "default": "/Users"
    }
  },

  activate(state) {
    var para = document.createElement("div");
    var t = document.createElement("input");
    this.dir = atom.config.get('cp-automation.directory');
    t.setAttribute("id", "contestCodeInput");
    Object.assign(t.style, {
      width: '100%',
      borderRadius: '2px',
      padding: '2px',
      marginTop: '2px',
      fontWeight:600
    })
    var heading = document.createTextNode("Enter contest code");
    para.appendChild(heading)
    para.appendChild(t);
    this.showpane = atom.workspace.addModalPanel({
      item: para,
    });

    this.log = () => {
      this.showpane.hide();
    }

    this.blah = () => {
      console.log(__dirname);
      console.log(this.dir);
      console.log(atom.workspace.getActiveTextEditor().getPath());
      t.value = '';
      this.showpane.show();
      document.getElementById('contestCodeInput').focus();
      document.getElementById("contestCodeInput").onkeyup = (e) => {
        e.preventDefault();
        var code = (e.keyCode );
        if (code == 13) {
          this.showpane.hide();
          if(t.value === ''){
            atom.notifications.addError('Enter a contest code')
          }
          else{
            this.contestCode = t.value;
            this.fetchData();
          }
        }
      }
    }
    this.cpAutomationView = new CpAutomationView(state.cpAutomationViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.cpAutomationView.getElement(),
      visible: false
    });

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'cp-automation:toggle': () => this.toggle(),
      'cp-automation:compile': () => this.compile(),
    }));

  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.cpAutomationView.destroy();
  },

  serialize() {
    return {
      cpAutomationViewState: this.cpAutomationView.serialize()
    };
  },

  toggle() {
    this.showpane.isVisible() ? this.log() : this.blah();
  },

  compile() {
    console.log('compiling');
    shell.cd('~/Desktop/');
    let filePath = atom.workspace.getActiveTextEditor().getPath();
    filePath = filePath.replace(/ /g, "\\ ")
    let dirPath = filePath.substring(0,filePath.lastIndexOf('/'));
    const tempdir = dirPath + '/';
    dirPath+='/abc.o';
    exec(`g++ ${filePath} -o ${dirPath}`,
      (error, stdout, stderr) => {
        console.log(`${stdout}`);
        console.log(`${stderr}`);
        if (error !== null) {
          console.log(`exec error: ${error}`);
        }
        this.executeCases(tempdir,dirPath);
      });
    },

    executeCases(tempdir,dirPath) {
      let a = 0;
      files = FileHound.create()
      .paths(tempdir)
      .match('input*')
      .find()
      .then((file) => {
        console.log(file[a]);
        file = file[a];
        let inputFileNum = file.match(/\d/);
        inputFileNum = file.indexOf(inputFileNum);
        let indexOfDot = file.indexOf('.');
        let number = file.substring(inputFileNum,indexOfDot);
        console.log(number);
        const output = tempdir + 'myOutput' + a + '.txt';
        console.log(`${dirPath} <${file} >${output}`);
        exec(`${dirPath} <${file} >${output}`);
        a++;
      });
    },

    fetchData(){
      atom.notifications.addInfo('Fetching data for the contest code ' + this.contestCode);
      let problems = [];962
      rp('http://codeforces.com/contest/' + this.contestCode, (error,response,body) => {
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
        baseurl1 = 'http://codeforces.com/contest/' + this.contestCode +'/problem/';
        fs.mkdirSync(this.dir + this.contestCode);
        Object.keys(problems).map((problem) => {
          this.testcases(baseurl1+problems[problem].code, problems[problem].name);
        });
      });
    },

    testcases(url,name){
      rp(url, (a,b,c) => {
        const $ = cheerio.load(c);
        fs.mkdirSync(this.dir + this.contestCode + '/' + name);
        fs.closeSync(fs.openSync(this.dir + this.contestCode + '/' + name + '/' + name + '.cpp', 'w'));
        fs.createReadStream('/Users/harshkhajuria/Desktop/cp-automation/lib/template.cpp').pipe(fs.createWriteStream(this.dir + this.contestCode + '/' + name + '/' + name + '.cpp'));
        $("div[class=\"input\"]").each((i,el) => {
          let xx = $(el).children("pre");
          console.log(xx.html());
          let ss = xx.html();
          ss = ss.replace(/<br>/g, "\n");
          fs.appendFileSync(this.dir + this.contestCode + '/' + name + '/input' + i +'.txt', ss);
        });
        $("div[class=\"output\"]").each((i,el) => {
          let xx = $(el).children("pre");
          console.log(xx.html());
          let ss = xx.html();
          ss = ss.replace(/<br>/g, "\n");
          fs.appendFileSync(this.dir + this.contestCode + '/' + name + '/output' + i +'.txt', ss);
        });
      })
      .then(() => {
        console.log('fetched');
      });
    }
  };
