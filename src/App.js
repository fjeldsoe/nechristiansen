import React, { Component } from 'react'
import {
  Switch,
  Redirect,
  Route,
  Link
} from 'react-router-dom'
import config from './config'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/database'
import cuid from 'cuid'
import './App.css'
import Gallery from './Gallery'


class App extends Component {

	constructor(props) {
		super(props)

		firebase.initializeApp(config.firebase)

		this.storageRef = firebase.storage().ref().child('images')
		this.databaseRef = firebase.database().ref().child('images')

		this.login = this.login.bind(this)
		this.logout = this.logout.bind(this)
		this.onDrop = this.onDrop.bind(this)
		this.onDragOver = this.onDragOver.bind(this)
		this.onDragEnd = this.onDragEnd.bind(this)
		this.loadImages = this.loadImages.bind(this)
		this.deleteImage = this.deleteImage.bind(this)

		this.state = {
			isLoggedIn: false,
			images: []
		}
	}

	componentDidMount() {

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
		})

		this.events()
	}

	events() {
		this.databaseRef.on('value', this.loadImages)
	}

	loadImages(snapshot) {

		const promiseUrls = []
		let imagesArr = []
		const ids = []

		snapshot.forEach(obj => {
			const url = this.storageRef.child(`${obj.key}/${obj.val().name}`).getDownloadURL()
			promiseUrls.push(url)
			imagesArr.push(Object.assign({id: obj.key}, obj.val()))
			ids.push(obj.key)
		})

		Promise.all(promiseUrls).then(urls => {

			imagesArr = urls.map((url, index) => Object.assign(imagesArr[index], {url: url}))

			this.setState({
				images: imagesArr
			})
		})
	}

	upload(file) {
		const id = cuid()
		const metadata = {
			customMetadata: {
				id: id,
				name: file.name
			}
		}

		this.storageRef.child(id + '/' + file.name).put(file, metadata)
	}

	onDrop(event) {
		event.preventDefault()

		if (!this.state.isLoggedIn) {
			alert('You must be logged in to upload images')
			return
		}

		// If dropped items aren't files, reject them
		var dt = event.dataTransfer;
		// Use DataTransferItemList interface to access the file(s)
		for (var i=0; i < dt.items.length; i++) {
			if (dt.items[i].kind === "file") {
				var file = dt.items[i].getAsFile();

				if (!file.type.includes('image')) {
					alert('File is not an image')
					return
				}

				this.upload(file)
			}
		}
		console.log(event.target);
	}

	onDragOver(event) {
		// Prevent default select and drag behavior
		event.preventDefault();

		if (!this.state.isLoggedIn) {
			return
		}
	}

	onDragEnd(event) {

		if (!this.state.isLoggedIn) {
			return
		}

		// Remove all of the drag data
		var dt = event.dataTransfer;
		// Use DataTransferItemList interface to remove the drag data
		for (var i = 0; i < dt.items.length; i++) {
			dt.items.remove(i);
		}
		console.log(event.target);
	}

	deleteImage(event) {

		if (!this.state.isLoggedIn) {
			return
		}

		const imageObj = this.getImageObj(event.target.id)
		const imageRef = this.storageRef.child(`${imageObj.id}/${imageObj.name}`)
		const updates = {}

		updates[imageObj.id] = null

		this.databaseRef.update(updates).then(() => {
			console.log('Deleted database ref');
			imageRef.delete().then(() => {
				console.log('Deleted storage ref');
			}).catch(error => console.error(error))
		}).catch(error => console.error(error))

	}

	getImageObj(id) {
		return this.state.images.filter(obj => obj.id === id)[0]
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
			<div className="app" onDrop={this.onDrop} onDragOver={this.onDragOver} onDragEnd={this.onDragEnd}>
                <Switch>
    				<Route path="/galleri" component={Gallery} />
                    <Redirect to="/galleri"/>
                </Switch>
				<footer className="footer">
					{
						this.state.isLoggedIn ? <div>Du er logget ind som {this.state.userName} - <span onClick={this.logout}>Log ud</span></div> : <span onClick={this.login}>Log ind</span>
					}
				</footer>
			</div>
		);
	}
}

export default App
