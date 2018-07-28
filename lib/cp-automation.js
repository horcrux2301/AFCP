'use babel';

import CpAutomationView from './cp-automation-view';
import {
  CompositeDisposable
} from 'atom';
import shell from 'shelljs';
import os from 'os';
import FileHound from 'filehound';
import ChildView from './component';
import DiffView from './diffComponent';
import fs from 'fs';
const path = require('path');
const jsdiff = require('diff');
const exec = require('child_process').exec;
const promiseexec = require('node-exec-promise').exec;
const now = require("performance-now");
const pidtree = require('pidtree');
const kill = require('tree-kill');


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
    },
    "DefaultGCC": {
      "type": "string",
      "default": "g++"
    },
    "GCCOptions": {
      "type": "string",
      "default": ""
    }
  },

  activate(state) {

    /*directories*/
    this.Codechefdir = atom.config.get('AFCP.Codechef');
    this.Codeforcesdir = atom.config.get('AFCP.Codeforces');
    this.Atcoderdir = atom.config.get('AFCP.Atcoder');
    this.TimeLimit = atom.config.get('AFCP.TimeLimit');
    this.defaultGCC = atom.config.get('AFCP.DefaultGCC');
    this.GCCOptions = atom.config.get('AFCP.GCCOptions');
    this.markers = new Array();
    this.panes = new Array();
    this.platform = os.platform();
    //  console.log(this);
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
    atom.config.observe('AFCP.DefaultGCC', (newValue) => {
      this.DefaultGCC = newValue;
    });
    atom.config.observe('AFCP.GCCOptions', (newValue) => {
      this.GCCOptions = newValue;
    });
    /*directories*/

    /*view*/
    let view = document.createElement("div");
    this.childView = new ChildView(this.Atcoderdir, this.Codeforcesdir, this.Codechefdir);
    view.appendChild(this.childView.element);
    /*view*/


    this.showpane = atom.workspace.addModalPanel({
      item: view,
    });


    this.hidePane = () => {
      this.showpane.hide();
    }

    this.revealPane = () => {
      /*view*/
      let view = document.createElement("div");
      this.childView = new ChildView(this.Atcoderdir, this.Codeforcesdir, this.Codechefdir, this.showpane);
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
      'cp-automation:toggle': () => this.toggle(),
      'cp-automation:diff': () => this.addPane(),
      'cp-automation:removeDiff': () => this.closePane()
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

  getTitle() {
    // Used by Atom for tab text
    return 'AFCP Diff Tab';
  },


  addPane() {
    this.closePane();


    let filePath = atom.workspace.getActiveTextEditor().getPath();
    let xx = filePath;
    xx = filePath.substring(0, filePath.lastIndexOf('/'));
    filePath = filePath.replace(/ /g, "\\ ")
    let dirPath = filePath.substring(0, filePath.lastIndexOf('/'));

    var doneFiles = new Promise(
      function(resolve, reject) {
        var filesArray = [];
        const files1 = FileHound.create()
          .depth(0)
          .paths(xx)
          .match('myOutput*')
          .find();

        const files2 = FileHound.create()
          .depth(0)
          .paths(xx)
          .match('output*')
          .find();

        const files = FileHound.any(files1, files2)
          .then((file) => {
            Object.keys(file).map((i) => {
              let file_here = file[i];
              var number = file_here.substring(
                file_here.lastIndexOf("/") + 1,
                file_here.lastIndexOf(".")
              );
              var name = number.substring(0, 8);
              if (name === "myOutput") {
                number = number.substring(8);
                //        console.log(number);
                filesArray.push({ in: file_here,
                  out: "",
                  number: number
                });
              }
            });

            Object.keys(file).map((i) => {
              let file_here = file[i];
              var number = file_here.substring(
                file_here.lastIndexOf("/") + 1,
                file_here.lastIndexOf(".")
              );
              var name = number.substring(0, 6);
              if (name === "output") {
                number = number.substring(6);
                Object.keys(filesArray).map((i) => {
                  if (filesArray[i].number === number) {
                    filesArray[i].out = file_here;
                  }
                })
              }
            });
            resolve(filesArray);
          })
      });

    var doneFilesPromise = () => {
      doneFiles
        .then((fulfilled) => {
          this.hogaya(fulfilled);
        })
        .catch(function(error) {
          console.log(error.message);
        });
    };
    doneFilesPromise();
  },


  hogaya(filesArray) {
    let newView1 = new DiffView(filesArray);
    let tempPanel = atom.workspace.addRightPanel({
      "item": newView1,
      "visible": true
    });
    this.panes.push(tempPanel);
  },

  closePane() {
    Object.keys(this.panes).map((index) => {
      this.panes[index].destroy();
    })
  },

  toggle() {
    this.showpane.isVisible() ? this.hidePane() : this.revealPane();
  },

  compile() {
    // console.log('compiling');
    shell.cd('~/Desktop/');
    atom.notifications.addInfo('Compiling and generating output');
    let filePath = atom.workspace.getActiveTextEditor().getPath();
    let extensionIndex = filePath.lastIndexOf('.');
    let extension = filePath.substring(extensionIndex + 1, filePath.length);
    if (extension === "cpp") {
      if (this.platform === "win32") {
        // console.log(filePath);
        let xx = filePath;
        xx = filePath.substring(0, filePath.lastIndexOf('\\'));
        // console.log("xx for windows is" , xx);
        let dirPath = filePath.substring(0, filePath.lastIndexOf('\\'));
        // console.log(dirPath);
        const tempdir = dirPath;
        let path2 = dirPath.substring(0, dirPath.lastIndexOf('\\'));
        // console.log("path2 is ", path2);
        dirPath += '\\abc.o';
        filePath = '"' + filePath + '"';
        dirPath = '"' + dirPath + '"';
        exec(`${this.DefaultGCC} ${this.GCCOptions} ${filePath} -o ${dirPath}`,
          (error, stdout, stderr) => {
            // console.log(`${stdout}`);
            // console.log(`${stderr}`);
            if (error !== null) {
              error = error.toString().substring(command.length + 23);
              console.log(`exec error: ${error}`);
              atom.notifications.addError(`Error in  compiling: ${error}`);
            }
            this.executeCasesWindows(tempdir, dirPath, xx);
          });
      } else {
        let xx = filePath;
        xx = filePath.substring(0, filePath.lastIndexOf('/'));
        filePath = filePath.replace(/ /g, "\\ ")
        let dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
        const tempdir = dirPath;
        dirPath += '/abc.o';
        let command = `${this.DefaultGCC} ${this.GCCOptions} ${filePath} -o ${dirPath}`;
        exec(`${this.DefaultGCC} ${this.GCCOptions} ${filePath} -o ${dirPath}`,
          (error, stdout, stderr) => {
            // console.log(`${stdout}`);
            // console.log(`${stderr}`);
            if (error !== null) {
              error = error.toString().substring(command.length + 23);
              console.log(`exec error: ${error}`);
              atom.notifications.addError(`Error in  compiling: ${error}`);
            }
            this.executeCases(tempdir, dirPath, xx);
          });
      }
    } else {
      atom.notifications.addError("Run this command through a cpp file");
    }
  },

  executeCasesWindows(tempdir, dirPath, xx) {
    // console.log('inside executing', tempdir, dirPath, xx);
    let a = 0;
    files = FileHound.create()
      .depth(0)
      .paths(xx)
      .match('input*')
      .find()
      .then((file) => {
        file.map((file) => {
          // console.log(file);
          // file = file.replace(/ /g,"\\ ");
          file = '"' + file + '"';
          let output = tempdir + '\\myOutput' + a + '.txt';
          output = '"' + output + '"';
          // console.log(`${dirPath} <${file} >${output}`);
          exec(`${dirPath} <${file} >${output}`);
          a++;
        });
      });
  },

  executeCases(tempdir, dirPath, xx) {
    let a = 0;
    files = FileHound.create()
      .depth(0)
      .paths(xx)
      .match('input*')
      .find()
      .then(
        (file) => {
          this.testCompilationFunction(file, tempdir, dirPath, xx)
        }
      );
  },

  async anotherFunction(dirPath, file, output) {
    let command = `gtimeout ${this.TimeLimit}s ${dirPath} <${file} >${output}`;
    const p = await promiseexec(`${dirPath} <${file} >${output}`, {
      timeout: 10000
    }, (error, stdout, stderr) => {
      if (error != null) {
        console.log(error);
        let message = error.message;
        message = error.message.substring(command.length + 16, error.message.length - command.length - 3);
        atom.notifications.addError(`Error while executing cases: ${message}`);
      }
    });
    return p;
  },


  async testCompilationFunction(files, tempdir, dirPath, xx) {
    //  console.log(files);
    let a = 0;
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      //  console.log(file);
      file = file.replace(/ /g, "\\ ");
      let output = tempdir + '/myOutput' + a + '.txt';
      let compare = tempdir + '/output' + a + '.txt';
      if (this.platform === 'darwin' || this.platform === "linux") {
        let command = `${dirPath} <${file} >${output}`;
        // console.log(`gtimeout ${this.TimeLimit}s ${dirPath} <${file} >${output}`);
        let start = now()
        //  console.log("file is ", file);

        const executeFilePromise = new Promise((resolve, reject) => {
          const limit = this.TimeLimit * 1000;
          //    console.log(limit);
          const childProcess = exec(command, {
            timeout: limit,
            killSignal: "SIGKILL"
          }, (err, b, c) => {
            if (err) {
              console.log("err occured", err);
              resolve(childProcess);
            } else {
              //      console.log("NO error and resolving");
              resolve({});
            }
          })
        });

        const killPromise = (child) => {
          return new Promise((resolve, reject) => {
            kill(child.pid + 1, 'SIGKILL', function(err) {
            //  console.log("child pid is ", child.pid + 1);
              if (err) {
                reject(err);
              } else {
                resolve({
                  msg: "We resolved this"
                });
              }
            });
            // pidtree(child.pid, function (err, pids) {
            //   console.log(pids)
            //     if (err) {
            //       reject(err);
            //     } else {
            //       resolve({
            //         msg: "We resolved this"
            //       });
            //     }
            //   // => []
            // })
          });
        }

        var child = await executeFilePromise;
        let end = now()
        let time = ((end - start) / 1000).toFixed(3)
        //    console.log(child.pid)
        //    console.log(time)
        if (child.pid) {
          await killPromise(child);
          atom.notifications.addError(`Time Limit Exceeded for file ${a}\n. Time taken: ${time} seconds`, {
            dismissable: true
          })
        } else {
          let file1 = output;
          let file2 = compare;
          file1 = file1.replace(/\\/g, '') 
          file2 = file2.replace(/\\/g, '')
          let f1 = 0,
            f2 = 0;
          try {
            var text1 = fs.readFileSync(file1).toString();
          } catch (err) {
            f1 = 1;
            console.log(err);
            atom.notifications.addInfo(`No myOutput${a}.txt found in this directory. Time taken: ${time} seconds`, {
              dismissable: true
            });
          }
          try {
            var text2 = fs.readFileSync(file2).toString();
          } catch (err) {
            f2 = 1;
            // console.log(err);
            let notif = atom.notifications.addInfo(`No output${a}.txt found in this directory. Time taken: ${time} seconds`, {
              dismissable: true
            });
          }
          let f3 = 0;
          if (!f1 && !f2) {
            //var diff = jsdiff.diffLines(text2, text1, {ignoreWhitespace: true, newlineIsToken: true});
            var diff = jsdiff.diffWords(text2, text1);
            // console.log(diff);
            Object.keys(diff).map((i) => {
              if (diff[i].added === true || diff[i].removed === true) {
                f3 = 1;
              }
            })
            if (!f3) {
              atom.notifications.addSuccess(`Accepted answer for file ${a}\n. Time taken: ${time} seconds`, {
                dismissable: true
              })
            } else {
              atom.notifications.addError(`Wrong answer for file ${a}\n. Time taken: ${time} seconds`, {
                dismissable: true
              })
            }
          }
        }
      }
      // else if (this.platform === 'linux') {
      //   // console.log(`timeout ${this.TimeLimit}s ${dirPath} <${file} >${output}`);
      //   exec(`gtimeout ${this.TimeLimit}s ${dirPath} <${file} >${output}`, (error, stdout, stderr) => {
      //     if (error != null) {
      //       console.log(error);
      //       let message = error.message;
      //       message = error.message.substring(command.length + 16, error.message.length - command.length - 3);
      //       atom.notifications.addError(`Error while executing cases: ${message}`);
      //     }
      //   });
      // } 
      else {
        // console.log(`${dirPath} <${file} >${output}`);
        exec(`${dirPath} <${file} >${output}`);
      }
      a++;
    }
  }
}