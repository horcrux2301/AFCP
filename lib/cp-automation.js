'use babel';

import CpAutomationView from './cp-automation-view';
import { CompositeDisposable } from 'atom';
import PythonShell from 'python-shell';
import request from 'request';
import cheerio from 'cheerio';
import fs from 'fs';
import rp from 'request-promise';

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
    var para = document.createElement("div");                       // Create a <p> element
    var t = document.createElement("input");      // Create a text node
    t.setAttribute("id", "Div1");
    Object.assign(t.style, {
      width: '100%',
      borderRadius: '2px',
      padding: '2px',
      marginTop: '2px'
    })
    var heading = document.createTextNode("Enter contest createTextNode");
    para.appendChild(heading)
    para.appendChild(t);
    this.showpane = atom.workspace.addModalPanel({
      item: para,
    });


    this.log = () => {
      this.showpane.hide();
    }

    this.blah = () => {
      t.value = '';
      this.showpane.show();
      document.getElementById('Div1').focus();
      document.getElementById("Div1").onkeyup = (e) => {
        e.preventDefault();
        var code = (e.keyCode );
        if (code == 13) { //Enter keycode
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

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'cp-automation:toggle': () => this.toggle()
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

  fetchData(){
    console.log('here');
    let problems = [];
    rp('http://codeforces.com/contest/961', (a,b,c) => {
      // console.log(a);
      // console.log(b);
      // console.log(c);
      // fs.appendFileSync('/Users/harshkhajuria/Desktop/cp-automation/lib/a.html', c);
      const $ = cheerio.load(c);
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
      baseurl1 = 'http://codeforces.com/contest/961/problem/';
      fs.mkdirSync('/Users/harshkhajuria/Desktop/' + 961);
      Object.keys(problems).map((problem) => {
        console.log(problems[problem]);
        this.testcases(baseurl1+problems[problem].code, problems[problem].name);
      });
    });
  },

  testcases(url,name){
    rp(url, (a,b,c) => {
      // console.log(a);
      // console.log(b);
      // console.log(c);
      // fs.appendFileSync('/Users/harshkhajuria/Desktop/cp-automation/lib/a.html', c);
      const $ = cheerio.load(c);
      // fs.appendFileSync('/Users/harshkhajuria/Desktop/cp-automation/lib/a.html', c);
      // let testcase = $("div[class=\"input\"]");
      // console.log(testcase.html());
      // let xx = testcase.children("pre");
      // console.log(xx.html());
      fs.mkdirSync('/Users/harshkhajuria/Desktop/' + 961 + '/' + name);
      // fs.closeSync(fs.openSync('/Users/harshkhajuria/Desktop/' + 961 + '/' + name + '/input.txt', 'w'));
      fs.closeSync(fs.openSync('/Users/harshkhajuria/Desktop/' + 961 + '/' + name + '/' + name + '.cpp', 'w'));
      // fs.closeSync(fs.openSync('/Users/harshkhajuria/Desktop/' + 961 + '/' + name + '/output.txt', 'w'));
      // fs.copyFileSync('/Users/harshkhajuria/Desktop/cp-automation/lib/template.cpp','/Users/harshkhajuria/Desktop/' + 961 + '/' + name + '/' + name + '.cpp');
      fs.createReadStream('/Users/harshkhajuria/Desktop/cp-automation/lib/template.cpp').pipe(fs.createWriteStream('/Users/harshkhajuria/Desktop/' + 961 + '/' + name + '/' + name + '.cpp'));
      $("div[class=\"input\"]").each((i,el) => {
        let xx = $(el).children("pre");
        console.log(xx.html());
        let ss = xx.html();
        ss = ss.replace(/<br>/g, "\n");
        fs.appendFileSync('/Users/harshkhajuria/Desktop/' + 961 + '/' + name + '/input' + i +'.txt', ss);
      });
      $("div[class=\"output\"]").each((i,el) => {
        let xx = $(el).children("pre");
        console.log(xx.html());
        let ss = xx.html();
        ss = ss.replace(/<br>/g, "\n");
        fs.appendFileSync('/Users/harshkhajuria/Desktop/' + 961 + '/' + name + '/output' + i +'.txt', ss);
      });
    })
    .then(() => {
      console.log('fetched');
    });
  }

};
