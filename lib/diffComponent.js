'use babel';
/** @jsx etch.dom */
const etch = require('etch');
const jsdiff = require('diff');
import fs from 'fs';

class ChildComponent {
  constructor (properties) {
    this.file = properties.file;
    this.number = properties.number;
    this.diff = [];
    this.element = <div>element from</div>
    etch.initialize(this);
  }
  
  update (properties) {
    this.file = properties.file;
    this.number = properties.number;
    let file1 = properties.file.in;
    let file2 = properties.file.out;
    // if(!fs.existsSync(file1) || ! fs.exsistsSync(file2)){
    //   console.log("a");
    //   return ;
    // }
    try{
      var text1 = fs.readFileSync(file1).toString();
    }
    catch (err){
      console.log(err);
      atom.notifications.addError(`No myOutput${this.number}.txt found in this directory`);
      this.diff = [];
      etch.update(this);
      return ;
    }
    try{
      var text2 = fs.readFileSync(file2).toString();
    }
    catch (err){
      console.log(err);
      atom.notifications.addError(`No output${this.number}.txt found in this directory`);
      this.diff = [];
      etch.update(this);
      return ;
    }
    //var diff = jsdiff.diffLines(text2, text1, {ignoreWhitespace: true, newlineIsToken: true});
    var diff = jsdiff.diffWords(text2, text1);
    this.diff = diff;
      
    let newDiff = [];
    
    
    Object.keys(this.diff).map((i) => {
      if (this.diff[i].added !== undefined && this.diff[i].added === true) {
        for (let index = 0; index < this.diff[i].value.length; index++) {
          if (this.diff[i].value[index] === '\n') {
            newDiff.push({"added": true, "removed": undefined, "value": '\n'});
          } else {
            newDiff.push({"added": true, "removed": undefined, "value": this.diff[i].value[index]});
          }
        }
      } else if (this.diff[i].removed !== undefined && this.diff[i].removed === true) {
        for (let index = 0; index < this.diff[i].value.length; index++) {
          if (this.diff[i].value[index] === '\n') {
            newDiff.push({"added": undefined, "removed": true, "value": '\n'});
          } else {
            newDiff.push({"added": undefined, "removed": true, "value": this.diff[i].value[index]});
          }
        }
      } else {
        for (let index = 0; index < this.diff[i].value.length; index++) {
          if (this.diff[i].value[index] === '\n') {
            newDiff.push({"added": undefined, "removed": undefined, "value": '\n'});
          } else {
            newDiff.push({"added": undefined, "removed": undefined, "value": this.diff[i].value[index]});
          }
        }
      }
      
      
    });
    
    this.diff = newDiff;
    return etch.update(this);
  }
  
  render () {
    return (
      <div>
        {
          Object.keys(this.diff).map((i) => {
            if (this.diff[i].added !== undefined && this.diff[i].added === true) {
              if (this.diff[i].value === '\n') {
                return <span class=" diffText addedText"><br/></span>;
              } else {
                return <span class="diffText addedText">{this.diff[i].value}</span>;
              }
            } else if (this.diff[i].removed !== undefined && this.diff[i].removed === true) {
              if (this.diff[i].value === '\n') {
                return <span class="diffText removedText"><br/></span>;
              } else {
                return <span class="diffText removedText">{this.diff[i].value}</span>;
              }
            } else {
              if (this.diff[i].value === '\n') {
                return <span class = "diffText"><br/></span>;
              } else {
                return <span class = "diffText">{this.diff[i].value}</span>;
              }
            }
          })
        }
      </div>
    );
  }
}

export default class DiffView {
  constructor (filesArray) {
    this.files = filesArray;
    this.number = 0;
    this.active = -1;
    etch.initialize(this);
  }
  
  update (props, children) {
    return etch.update(this);
  }
  
  didClick(e, number) {
    e.preventDefault();
    this.number = number;
    this.active = number;
    return etch.update(this);
  }

  render () {
  //  console.log(this.files);
    return (
      <div className = "main-div">
        <div className="diff-view-header"> AFCP Diff View </div>
        <div className='files-list-div'>
          {
            Object.keys(this.files).map((i) => {
              return <li className = {this.active===i ? 'files-list files-list-active' : 'files-list'} on={{ click: (e) => this.didClick(e, i) }}>File {this.files[i].number}</li>
            })
          }
        </div>
        <ChildComponent file={this.files[this.number]} number = {this.number}/>
      </div>
    );
  }
}
