'use babel';

import CpAutomationView from './cp-automation-view';
import { CompositeDisposable } from 'atom';
import PythonShell from 'python-shell';

export default {

  cpAutomationView: null,
  modalPanel: null,
  subscriptions: null,

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
    // atom.views.addViewProvider(TextEditor, (TextEditor) => {
    //   this.textEditorElement = new TextEditorElement
    //   textEditorElement.initialize(textEditor)
    // });
    this.showpane.isVisible() ? this.log() : this.blah();
  },

  fetchData(){
    var options = {
      mode: 'text',
      pythonPath: '/Library/Frameworks/Python.framework/Versions/3.6/bin/python3',
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: '/Users/harshkhajuria/Desktop/cp-automation/lib',
      args: [this.contestCode]
    };

    console.log(options);

    // var pyshell = new PythonShell('my_script.py');
    //
    // PythonShell.send('JUNE15');

    PythonShell.run('codechef.py', options, function (err, results) {
      if (err) throw err;
      // results is an array consisting of messages collected during execution
      console.log('results: %j', results);
    });
  }

};
