import React, { Component } from 'react'
import {
  Link
} from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/database'

class Gallery extends Component {

	constructor() {
		super()

		this.loadImages = this.loadImages.bind(this)
		this.deleteImage = this.deleteImage.bind(this)
        this.storageRef = firebase.storage().ref().child('images')
        this.databaseRef = firebase.database().ref().child('images')

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

	render() {
        const selectedImage = this.props.match.params.id ? this.getImageObj(this.props.match.params.id) : null

        console.log(selectedImage);

		return (
			<div className="gallery">
				<main className="grid">
                    {
                        selectedImage ? (
                            <div className="grid__col">
                                {
                                    <img id={selectedImage.id} className="image" src={selectedImage.url} alt={selectedImage.name} />
                                }
                            </div>
                        ) : (
                            this.state.images.map((imageObj, index) => (
        						<div className="grid__col" key={index}>
                                    <Link to={`/${imageObj.id}`}>
                                        <img id={imageObj.id} className="image" src={imageObj.url} alt={imageObj.name} key={index} />
                                    </Link>
        						</div>
        					))
                        )
                    }
				</main>
			</div>
		);
	}
}

export default Gallery
