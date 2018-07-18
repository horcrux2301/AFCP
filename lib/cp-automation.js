'use babel';

import CpAutomationView from './cp-automation-view';
import { CompositeDisposable } from 'atom';
import shell from 'shelljs';
import os from 'os';
import FileHound from 'filehound';
import ChildView from './component';
import DiffView from './diffComponent';
import fs from 'fs';
var path = require('path');
var jsdiff = require('diff');
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
    atom.config.observe('AFCP.DefaultGCC', (newValue) => {
      this.DefaultGCC = newValue;
    });
    atom.config.observe('AFCP.GCCOptions', (newValue) => {
      this.GCCOptions = newValue;
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

    this.revealPane = () => {
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


  addPane(){
    this.closePane();


    let filePath = atom.workspace.getActiveTextEditor().getPath();
    let xx = filePath;
    xx = filePath.substring(0,filePath.lastIndexOf('/'));
    filePath = filePath.replace(/ /g, "\\ ")
  //  console.log(filePath)
    let dirPath = filePath.substring(0,filePath.lastIndexOf('/'));
    // console.log(dirPath);


    
    // var filesArray= [];
    // const files1 = FileHound.create()
    // .paths(xx)
    // .match('myOutput*')
    // .find();
    // 
    // 
    // console.log("here");
    // 
    // const files2 = FileHound.create()
    // .paths(xx)
    // .match('output*')
    // .find();
    // 
    // const files = FileHound.any(files1, files2)
    // .then( (file) => {
    //   Object.keys(file).map((i) => {
    //     let file_here = file[i];
    //     var number = file_here.substring(
    //       file_here.lastIndexOf("/")+1,
    //       file_here.lastIndexOf(".")
    //     );
    //     var name = number.substring(0,8);
    //     if(name==="myOutput"){
    //       number = number.substring(8);
    //       console.log(number);
    //       filesArray.push({in: file_here, out: "", number: number});
    //     }
    //   });
    // 
    //   Object.keys(file).map((i) => {
    //     let file_here = file[i];
    //     var number = file_here.substring(
    //       file_here.lastIndexOf("/")+1,
    //       file_here.lastIndexOf(".")
    //     );
    //     var name = number.substring(0,6);
    //     if(name==="output"){
    //       number = number.substring(6);
    //       Object.keys(filesArray).map((i) => {
    //         if(filesArray[i].number===number){
    //           filesArray[i].out = file_here;
    //         }
    //       })
    //     }
    //   });
    // 
    //   console.log(filesArray);
    // 
    // })
    
    var doneFiles = new Promise(
    function (resolve, reject) {
      var filesArray= [];
      const files1 = FileHound.create()
      .paths(xx)
      .match('myOutput*')
      .find();


//      console.log("here");

      const files2 = FileHound.create()
      .paths(xx)
      .match('output*')
      .find();

      const files = FileHound.any(files1, files2)
      .then( (file) => {
        Object.keys(file).map((i) => {
          let file_here = file[i];
          var number = file_here.substring(
            file_here.lastIndexOf("/")+1,
            file_here.lastIndexOf(".")
          );
          var name = number.substring(0,8);
          if(name==="myOutput"){
            number = number.substring(8);
    //        console.log(number);
            filesArray.push({in: file_here, out: "", number: number});
          }
        });

        Object.keys(file).map((i) => {
          let file_here = file[i];
          var number = file_here.substring(
            file_here.lastIndexOf("/")+1,
            file_here.lastIndexOf(".")
          );
          var name = number.substring(0,6);
          if(name==="output"){
            number = number.substring(6);
            Object.keys(filesArray).map((i) => {
              if(filesArray[i].number===number){
                filesArray[i].out = file_here;
              }
            })
          }
        });

    //    console.log(filesArray);
        resolve(filesArray);
      })
    });
    
    var doneFilesPromise =  () => {
    doneFiles
        .then( (fulfilled) => {
        //    console.log(fulfilled);
            this.hogaya(fulfilled);
        })
        .catch(function (error) {
            console.log(error.message);
        });
    };
    
    doneFilesPromise();
  },
  
  makefiles(){
    var filesArray= [];
    const files1 = FileHound.create()
    .paths(xx)
    .match('myOutput*')
    .find();

    const files2 = FileHound.create()
    .paths(xx)
    .match('output*')
    .find();

    const files = FileHound.any(files1, files2)
    .then( (file) => {
      Object.keys(file).map((i) => {
        let file_here = file[i];
        var number = file_here.substring(
          file_here.lastIndexOf("/")+1,
          file_here.lastIndexOf(".")
        );
        var name = number.substring(0,8);
        if(name==="myOutput"){
          number = number.substring(8);
          // console.log(number);
          filesArray.push({in: file_here, out: "", number: number});
        }
      });

      Object.keys(file).map((i) => {
        let file_here = file[i];
        var number = file_here.substring(
          file_here.lastIndexOf("/")+1,
          file_here.lastIndexOf(".")
        );
        var name = number.substring(0,6);
        if(name==="output"){
          number = number.substring(6);
          Object.keys(filesArray).map((i) => {
            if(filesArray[i].number===number){
              filesArray[i].out = file_here;
            }
          })
        }
      });

      // console.log(filesArray);

    })
  },

  hogaya(filesArray){
    // console.log(filesArray);
    activePane = atom.workspace.getActivePane();
    newPane = activePane.splitRight();
    let newView = new DiffView(filesArray);
    newView.getTitle = this.getTitle;
    newPane.addItem(newView);
    this.panes.push(newPane);
    
  },

  closePane(){
    Object.keys(this.panes).map((index)=> {
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
    let extension = filePath.substring(extensionIndex+1,filePath.length);
    if(extension==="cpp"){
      if(this.platform==="win32"){
        // console.log(filePath);
        let xx = filePath;
        xx = filePath.substring(0,filePath.lastIndexOf('\\'));
        // console.log("xx for windows is" , xx);
        let dirPath = filePath.substring(0,filePath.lastIndexOf('\\'));
        // console.log(dirPath);
        const tempdir = dirPath;
        let path2 = dirPath.substring(0,dirPath.lastIndexOf('\\'));
        // console.log("path2 is ", path2);
        dirPath+='\\abc.o';
        filePath = '"' + filePath + '"';
        dirPath = '"' + dirPath + '"';
        exec(`${this.DefaultGCC} ${this.GCCOptions} ${filePath} -o ${dirPath}`,
          (error, stdout, stderr) => {
            // console.log(`${stdout}`);
            // console.log(`${stderr}`);
            if (error !== null) {
              console.log(`exec error: ${error}`);
              atom.notifications.addError(`Error in  compiling: ${error}`);
            }
            this.executeCasesWindows(tempdir,dirPath,xx);
          });
        }
        else{
          let xx = filePath;
          xx = filePath.substring(0,filePath.lastIndexOf('/'));
          filePath = filePath.replace(/ /g, "\\ ")
          let dirPath = filePath.substring(0,filePath.lastIndexOf('/'));
          const tempdir = dirPath;
          dirPath+='/abc.o';
          exec(`${this.DefaultGCC} ${this.GCCOptions} ${filePath} -o ${dirPath}`,
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

      executeCasesWindows(tempdir,dirPath,xx){
        // console.log('inside executing', tempdir, dirPath, xx);
        let a = 0;
        files = FileHound.create()
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

      executeCases(tempdir,dirPath,xx) {
        let a = 0;
        files = FileHound.create()
        .paths(xx)
        .match('input*')
        .find()
        .then((file) => {
          file.map((file) => {
            file = file.replace(/ /g,"\\ ");
            let output = tempdir + '/myOutput' + a + '.txt';
            let compare = tempdir + '/output' + a + '.txt';
            if(this.platform==='darwin'){
              // console.log(`gtimeout ${this.TimeLimit}s ${dirPath} <${file} >${output}`);
              exec(`gtimeout ${this.TimeLimit}s ${dirPath} <${file} >${output}`, (cd,ef,gh) => {
                // console.log(file);
                // console.log(output);
                // file = file.replace(/\\/g, '');
                // output = output.replace(/\\/g, '');
                // compare = compare.replace(/\\/g, '');
                //rel
                //
                //
                // console.log(file);
                // console.log(compare);
                // var file1 = fs.readFileSync(file).toString();
                // var file2 = fs.readFileSync(output).toString();
                // var file3 = fs.readFileSync(compare).toString();
                // console.log(file1, file3);
                // var diff = jsdiff.diffWords(file2, file3, {"newlineIsToken": false});
                // console.log(diff);
                //
                // fs.appendFileSync(output, '\n');
                // fs.appendFileSync(output, "Diff\n");
                // fs.appendFileSync(output, "========================\n");
                //
                // diff.forEach(function(part){
                //   // green for additions, red for deletions
                //   // grey for common parts
                //   // var color = part.added ? 'green' :
                //   //   part.removed ? 'red' : 'grey';
                //   // process.stderr.write(part.value[color]);
                //   console.log(part.value);
                //   fs.appendFileSync(output, part.value);
                // });
              });
            }
            else if(this.platform==='linux'){
              // console.log(`timeout ${this.TimeLimit}s ${dirPath} <${file} >${output}`);
              exec(`timeout ${this.TimeLimit}s ${dirPath} <${file} >${output}`);
            }
            else{
              // console.log(`${dirPath} <${file} >${output}`);
              exec(`${dirPath} <${file} >${output}`);
            }
            a++;
          });
        });
      },

      generateDiff(xx){
        console.log('here');
        console.log(xx);
        var filesArray= [];
        files = FileHound.create()
        .paths(xx)
        .match('myOutput*')
        .find()
        .then((file) => {
          file.map((file) => {
            var number = file.substring(
              file.lastIndexOf("/")+1,
              file.lastIndexOf(".")
            );
            number = number.substring(8);
            filesArray.push({in: file, out: "", number: number, diff: ""});
          })
          // console.log(filesArray);
        });
        files = FileHound.create()
        .paths(xx)
        .match('output*')
        .find()
        .then((file) => {
          file.map((file) => {
            var file_base = file.substring(
              file.lastIndexOf("/")+1,
              file.lastIndexOf(".")
            );
            number = file_base.substring(6);
            Object.keys(filesArray).map((i) => {
              console.log(filesArray[i].number, number);
              if(filesArray[i].number==number){
                filesArray[i].out=file;
                filesArray[i].diff=file.substring(0,file.lastIndexOf("/"))+"/diff"+number+".txt";
              }
            });
          })
          // console.log(filesArray);
          Object.keys(filesArray).map((i) => {
            // let newPath = "atom://open?url=file:///" + filesArray[i].in;
            // console.log(newPath);
            var file1 = filesArray[i].in;
            var file2 = filesArray[i].out;
            var file3 = filesArray[i].diff;
            console.log(file1, file2);
            //atom.workspace.open(filesArray[i].in);
            // atom.workspace.open(filesArray[i].in).then((editor) => {
            // // range = [[1, 0], [1, 0]];
            // // marker = editor.markBufferRange(range);
            // marker = editor.markBufferRange([[2, 0], [2, 30]], {invalidate: 'never'});
            // console.log(editor);
            // editor.decorateMarker(marker, {type: 'highlight', class: 'changeColor'});
            // // decoration = editor.decorateMarker(marker, type: 'gutter', class: "changeColor");
            // });
            var text1 = fs.readFileSync(file1).toString();
            var text2 = fs.readFileSync(file2).toString();
            var diff = jsdiff.diffChars(text1, text2);

          //  console.log(text1);
             console.log(text2);

            console.log({diff});

            // fs.appendFileSync(file1, '\n');

            if (!fs.existsSync(file3)) {
              console.log("does not exsist and creating");
              fs.writeFile(file3, "Diff", 'utf8', (err) => {
                  if (err) {throw err; console.log(err);}
                  console.log('The file has been saved!');
              });
            }
            else{
              console.log("already exsists");
            }


            // var markerArray= [];
            //console.log(this.markers);
            atom.workspace.open(file3).then((editor) => {
              //console.log(this.markers);
              Object.keys(this.markers).map((i) => {
                this.markers[i].destroy();
              })
              this.markers.length=0;
              //console.log(this.markers);
              buffer = editor.buffer;
              range  = buffer.getRange();
              //console.log(buffer, range );
              buffer.delete(range);

              //console.log(editor);
              buffer.append("Diff\n============\n");
              diff.forEach((part,i) => {
                buffer = editor.buffer;
                range  = buffer.append(part.value);
                console.log("initial range calculated with space is ", range);
                let startrow = range.start.row;
                let startcol = range.start.column;
                let endcol = range.end.column;
                let endrow = range.end.row;
                console.log("initial numbers ", {startrow, startcol, endrow, endcol});
                // console.log(typeof(endcol));
                // if(endcol===0){
                //   //console.log('here');
                //   endrow = startrow;
                //   endcol = startcol+part.value.length;
                //   //console.log({startrow, startcol, endrow, endcol});
                // }
                // startcol-=1;
                // endcol-=1;
                //console.log({startrow, startcol, endrow, endcol});
                // range = [[startrow, startcol],[endrow, endcol-1]];
                // range1 = [[startrow, startcol],[endrow, endcol-1]];
                // console.log("clipped range is ", buffer.clipRange(range));
                range = buffer.clipRange(range);
                // let pqr = new Range(range);
                // console.log(pqr.toString());
                console.log(part);
                if(part.added===true){
                  console.log("final range for addition is ", range);
                  //console.log("part added ", part.added);
                  marker = editor.markBufferRange(range, {invalidate: 'never'});
                  editor.decorateMarker(marker, {type: 'highlight', class: 'addedText'});
                  //console.log(typeof(this.markers));
                  //console.log({i});
                  // if(i!==diff.length-1){
                  //   console.log("deleting", buffer.getTextInRange([[startrow, endcol-1],[endrow, endcol]]));
                  //   console.log("length is ", buffer.getTextInRange([[startrow, endcol-1],[endrow, endcol]]).length, " and range is ", ([[startrow, endcol-1],[endrow, endcol]]));
                  //   buffer.delete([[startrow, endcol-1],[endrow, endcol]]);
                  // }
                  this.markers.push(marker);
                }
                else if(part.removed===true){
                  console.log("final range for deletion is ", range);
                  //console.log("part removed ", part.removed);
                  marker = editor.markBufferRange(range, {invalidate: 'never'});
                  editor.decorateMarker(marker, {type: 'highlight', class: 'removedText'});
                  //console.log({i});
                  // if(i!==diff.length-1){
                  //   console.log("deleting" , buffer.getTextInRange([[startrow, endcol-1],[endrow, endcol]]));
                  //   console.log("length is ", buffer.getTextInRange([[startrow, endcol-1],[endrow, endcol]]).length, " and range is ", ([[startrow, endcol-1],[endrow, endcol]]));
                  //   buffer.delete([[startrow, endcol-1],[endrow, endcol]]);
                  // }
                  //console.log(typeof(this.markers));
                  this.markers.push(marker);
                }
                else{
                  console.log("final range for normal is ", range);
                  //console.log("part removed ", part.removed);
                  marker = editor.markBufferRange(range, {invalidate: 'never'});
                  editor.decorateMarker(marker, {type: 'highlight', class: 'noneText priorityText'});
                  //console.log({i});
                  // if(i!==diff.length-1){
                  //   console.log("deleting", buffer.getTextInRange([[startrow, endcol-1],[endrow, endcol]]));
                  //   console.log("length is ", buffer.getTextInRange([[startrow, endcol-1],[endrow, endcol]]).length, " and range is ", ([[startrow, endcol-1],[endrow, endcol]]));
                  //   buffer.delete([[startrow, endcol-1],[endrow, endcol]]);
                  // }
                  //console.log(typeof(this.markers));
                  this.markers.push(marker);
                }
              });
            });

            // fs.writeFile(file3, "Diff", 'utf8', (err) => {
            //     if (err) {throw err; console.log(err);}
            //     console.log('The file has been saved!');
            // });







            // fs.appendFileSync(file3, "Diff\n");
            // fs.appendFileSync(file3, "========================\n");

            // diff.forEach(function(part){
            //   fs.appendFileSync(file1, part.value);
            // });

            // atom.workspace.open(filesArray[i].in).then((editor) => {
            // console.log(editor);
            // buffer = editor.buffer;
            // range  = buffer.append("abcdef");
            // marker = editor.markBufferRange(range, {invalidate: 'never'});
            // console.log(editor);
            // editor.decorateMarker(marker, {type: 'highlight', class: 'changeColor'});
            //
            // });

          });
        });

        // console.log(filesArray.length);
        //
        // Object.keys(filesArray).map(() => {
        //   console.log('a');
        // })
        //
        // Object.keys(filesArray).map((i) => {
        //   console.log(filesArray);
        //   var file1 = filesArray[i].in;
        //   var file2 = filesArray[i].out;
        //   console.log(file1, file2);
        //   fs.appendFileSync(file1, '\n');
        //   fs.appendFileSync(file1, "Diff\n");
        //   fs.appendFileSync(file1, "========================\n");
        //   var text1 = fs.readFileSync(file1).toString();
        //   var text2 = fs.readFileSync(file2).toString();
        //   console.log(text1, text2);
        //   diff.forEach(function(part){
        //     fs.appendFileSync(file1, part.value);
        //   });
        // });
        //
        // filesArray.forEach((i) => {
        //   console.log(i, filesArray[i]);
        // });
        //
        //
        // console.log(filesArray);
      }

    };
