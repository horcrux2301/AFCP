'use babel';

import CpAutomationView from './cp-automation-view';
import { CompositeDisposable } from 'atom';
import shell from 'shelljs';
import os from 'os';
import FileHound from 'filehound';
import ChildView from './component';
const exec = require('child_process').exec;

export default {

  cpAutomationView: null,
  modalPanel: null,
  subscriptions: null,

  "config": {
    "Codechef": {
      "type": "string",
      "default": "/Users"
    },
    "Codeforces": {
      "type": "string",
      "default": "/Users"
    },
    "Atcoder": {
      "type": "string",
      "default": "/Users"
    },
    "TimeLimit": {
      "type": "integer",
      "default": 5
    }
  },

  activate(state) {

    /*directories*/
    this.Codechefdir = atom.config.get('AFCP.Codechef');
    this.Codeforcesdir = atom.config.get('AFCP.Codeforces');
    this.Atcoderdir = atom.config.get('AFCP.Atcoder');
    this.TimeLimit = atom.config.get('AFCP.TimeLimit');
    this.platform = os.platform();
    console.log(this);
    atom.config.observe('AFCP.Codechef', (newValue) => {
      this.Codechefdir = newValue;
    });
    atom.config.observe('AFCP.Codeforces', (newValue) => {
      this.Codeforcesdir = newValue;
    });
    atom.config.observe('AFCP.Atcoder', (newValue) => {
      this.Atcoderdir = newValue;
    });
    atom.config.observe('AFCP.TimeLimit', (newValue) => {
      this.TimeLimit = newValue;
    });
    /*directories*/

    /*view*/
    let view = document.createElement("div");
    this.childView = new ChildView(this.Atcoderdir, this.Codeforcesdir,this.Codechefdir);
    view.appendChild(this.childView.element);
    /*view*/


    this.showpane = atom.workspace.addModalPanel({
      item: view,
    });


    this.hidePane = () => {
      this.showpane.hide();
    }

    this.showPane = () => {
      /*view*/
      let view = document.createElement("div");
      this.childView = new ChildView(this.Atcoderdir, this.Codeforcesdir,this.Codechefdir,this.showpane);
      view.appendChild(this.childView.element);
      /*view*/


      this.showpane = atom.workspace.addModalPanel({
        item: view,
      });
      this.showpane.show();
    }

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'cp-automation:compile': () => this.compile(),
      'cp-automation:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.cpAutomationView.destroy();
  },

  // serialize() {
  //   return {
  //     cpAutomationViewState: this.cpAutomationView.serialize()
  //   };
  // },

  toggle() {
    this.showpane.isVisible() ? this.hidePane() : this.showPane();
  },

  compile() {
    console.log('compiling');
    shell.cd('~/Desktop/');
    let filePath = atom.workspace.getActiveTextEditor().getPath();
    let xx = filePath;
    xx = filePath.substring(0,filePath.lastIndexOf('/'));
    let extensionIndex = filePath.lastIndexOf('.');
    let extension = filePath.substring(extensionIndex+1,filePath.length);
    if(extension==="cpp"){
      console.log(dirPath);
      if(this.platform==="win32"){
        let dirPath = filePath.substring(0,filePath.lastIndexOf('/'));
        const tempdir = dirPath;
        dirPath+='/abc.o';
        exec(`g++ ${filePath} -o ${dirPath}`,
          (error, stdout, stderr) => {
            // console.log(`${stdout}`);
            // console.log(`${stderr}`);
            if (error !== null) {
              console.log(`exec error: ${error}`);
              atom.notifications.addError(`Error in  compiling: ${error}`);
            }
            this.executeCases(tempdir,dirPath,xx);
          });
      }
      else{
        filePath = filePath.replace(/ /g, "\\ ")
        let dirPath = filePath.substring(0,filePath.lastIndexOf('/'));
        const tempdir = dirPath;
        dirPath+='/abc.o';
        exec(`g++ ${filePath} -o ${dirPath}`,
          (error, stdout, stderr) => {
            // console.log(`${stdout}`);
            // console.log(`${stderr}`);
            if (error !== null) {
              console.log(`exec error: ${error}`);
              atom.notifications.addError(`Error in  compiling: ${error}`);
            }
            this.executeCases(tempdir,dirPath,xx);
          });
      }
    }
    else{
      atom.notifications.addError("Run this command through a cpp file");
    }
    },

    executeCases(tempdir,dirPath,xx) {
      let a = 0;
      files = FileHound.create()
      .paths(xx)
      .match('input*')
      .find()
      .then((file) => {
        file.map((file) => {
          console.log(file);
          file = file.replace(/ /g,"\\ ");
          const output = tempdir + '/myOutput' + a + '.txt';
          if(this.platform==='darwin'){
            console.log(`gtimeout ${this.TimeLimit}s ${dirPath} <${file} >${output}`);
            exec(`gtimeout ${this.TimeLimit}s ${dirPath} <${file} >${output}`);
          }
          else if(this.platform==='linux'){
            console.log(`timeout ${this.TimeLimit}s ${dirPath} <${file} >${output}`);
            exec(`timeout ${this.TimeLimit}s ${dirPath} <${file} >${output}`);
          }
          else{
            console.log(`${dirPath} <${file} >${output}`);
            exec(`${dirPath} <${file} >${output}`);
          }
          a++;
        });
      });
    }
  };
