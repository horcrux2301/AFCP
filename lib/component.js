'use babel';
/** @jsx etch.dom */

const etch = require('etch')
import { FetchDataCodeforces } from './codeforces';
import { FetchDataAtcoder } from './atcoder';
import { FetchDataCodechef } from './codechef';

export default class ChildView {
  constructor (Atcoderdir,Codeforcesdir,Codechefdir) {
    this.isCodechef = false;
    this.isCodeforces = false;
    this.isAtcoder = false;
    this.contestCode = '';
    this.Atcoderdir = Atcoderdir;
    this.Codeforcesdir = Codeforcesdir;
    this.Codechefdir = Codechefdir;
    etch.initialize(this)
  }
  render () {
    return <div>
    <div className='heading'>
      Select the site and enter the code.
    </div>
    <div className='top-div'>
      <span className='check-span'>
        <input type="radio" checked={this.isCodechef} on={{click: this.clickedCodeChef}} className='ratio-btn'/> Codechef
      </span>
      <span className='check-span'>
        <input type="radio" checked={this.isCodeforces} on={{click: this.clickedCodeforces}} className='ratio-btn'/> Codeforces
      </span>
      <span className='check-span'>
        <input type="radio" checked={this.isAtcoder} on={{click: this.clickedAtCoder}} className='ratio-btn'/> Atcoder
      </span>
    </div>
    <div className='bottom-div'>
      <input type="text" on={{change: this.changedContestCode}} className='contestcode-input'/>
      <button type="submit" on={{click: this.getData}} className='fetch-btn'>Fetch Data</button>
    </div>
    </div>
  }

  clickedCodeChef(){
    this.isCodechef = true;
    this.isCodeforces = false;
    this.isAtcoder = false;
    etch.update(this)
  }

  clickedCodeforces(){
    this.isCodechef = false;
    this.isCodeforces = true;
    this.isAtcoder = false;
    etch.update(this)
  }

  clickedAtCoder(){
    this.isCodechef = false;
    this.isCodeforces = false;
    this.isAtcoder = true;
    etch.update(this)
  }

  getContestCode(){
    return this.contestCode;
  }

  getData(e){
    e.preventDefault();
    if(this.contestCode===''){
      atom.notifications.addError('Add a contest code.');
    }
    else{
      if(this.isCodechef===true){
        FetchDataCodechef(this.Codechefdir, this.contestCode);
      }
      else if(this.isAtcoder===true){
        FetchDataAtcoder(this.Atcoderdir, this.contestCode);
      }
      else if(this.isCodeforces===true){
        FetchDataCodeforces(this.Codeforcesdir, this.contestCode);
      }
      else{
        atom.notifications.addError('Select a site');
      }
    }
  }

  changedContestCode(e){
    this.contestCode = e.target.value;
  }

  update () {
    return etch.update(this)
  }

  async destroy () {
    await etch.destroy(this)
  }
}
