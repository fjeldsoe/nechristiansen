import React, { Component } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import logo from './images/logo.svg'
import './App.css'

class App extends Component {

	constructor() {
		super()

		this.provider = new firebase.auth.FacebookAuthProvider()

		firebase.auth().signInWithPopup(this.provider).then(function(result) {
		  console.log(result);
		}).catch(function(error) {
		  console.log(error);
		});

		this.storageRef = firebase.storage().ref()

		this.drop_handler = this.drop_handler.bind(this)
		this.dragover_handler = this.dragover_handler.bind(this)

	}

	drop_handler(ev) {
		console.log("Drop");
		ev.preventDefault();
		// If dropped items aren't files, reject them
		var dt = ev.dataTransfer;
		if (dt.items) {
			// Use DataTransferItemList interface to access the file(s)
			for (var i=0; i < dt.items.length; i++) {
				if (dt.items[i].kind === "file") {
					var f = dt.items[i].getAsFile();
					console.log(f.name)
					const uploadTask = this.storageRef.child('/images/' + f.name).put(f)
					uploadTask.then(function(snapshot) {
					  console.log('Uploaded a blob or file!');
					});
				}
			}
		} else {
			// Use DataTransfer interface to access the file(s)
			for (var j=0; j < dt.files.length; j++) {
				console.log("... file[" + j + "].name = " + dt.files[j].name);
			}
		}
	}

	dragover_handler(ev) {
		console.log("dragOver");
		// Prevent default select and drag behavior
		ev.preventDefault();
	}

	render() {
		return (
			<div className="App" onDrop={this.drop_handler} onDragOver={this.dragover_handler}>
				<div className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Welcome to React</h2>
				</div>
				<p className="App-intro">
					To get started, edit <code>src/App.js</code> and save to reload.
				</p>
			</div>
		);
	}
}

export default App
