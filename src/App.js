import React, { Component } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import logo from './images/logo.svg'
import './App.css'

class App extends Component {

	constructor() {
		super()

		this.storageRef = firebase.storage().ref()

		this.login = this.login.bind(this)
		this.logout = this.logout.bind(this)

		this.onDrop = this.onDrop.bind(this)
		this.onDragOver = this.onDragOver.bind(this)
		this.onDragEnd = this.onDragEnd.bind(this)

		this.state = {isLoggedIn: false}

		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				this.setState({
					isLoggedIn: true,
					userName: user.displayName
				})
			} else {
				this.setState({
					isLoggedIn: false,
					userName: ''
				})
			}
		});

	}

	onDrop(event) {
		event.preventDefault()
		// If dropped items aren't files, reject them
		var dt = event.dataTransfer;
		// Use DataTransferItemList interface to access the file(s)
		for (var i=0; i < dt.items.length; i++) {
			if (dt.items[i].kind === "file") {
				var file = dt.items[i].getAsFile();
				const uploadTask = this.storageRef.child('/images/' + file.name).put(file)
				uploadTask.then(function(snapshot) {
					console.log('Uploaded a blob or file!');
				})
			}
		}
	}

	onDragOver(event) {
		// Prevent default select and drag behavior
		event.preventDefault();
	}

	onDragEnd(event) {
		console.log("dragEnd");
		// Remove all of the drag data
		var dt = event.dataTransfer;
		// Use DataTransferItemList interface to remove the drag data
		for (var i = 0; i < dt.items.length; i++) {
			dt.items.remove(i);
		}

	}

	login() {

		if (this.setState.isLoggedIn) {
			console.log('user is already logged in')
			return
		}

		this.provider = new firebase.auth.FacebookAuthProvider()

		firebase.auth().signInWithPopup(this.provider).then(result => {

		}).catch(error => {
			console.log(error)
		});
	}

	logout() {
		firebase.auth().signOut().then(() => {
			// Sign-out successful.
		}).catch(error => {
			// An error happened.
		});
	}

	render() {
		return (
			<div className="App" onDrop={this.onDrop} onDragOver={this.onDragOver} onDragEnd={this.onDragEnd}>
				<div className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Welcome to React {this.state.userName}</h2>
				</div>
				<p className="App-intro">
					{
						this.state.isLoggedIn ? <span onClick={this.logout}>Logout</span> : <span onClick={this.login}>Login</span>
					}
				</p>
			</div>
		);
	}
}

export default App
