import React, { Component } from 'react'
import {
  Link,
  Route
} from 'react-router-dom'
import config from './config'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/database'
import Painting from './Painting'

export default class Gallery extends Component {

	constructor(props) {
		super(props)

		this.loadImages = this.loadImages.bind(this)
		this.deleteImage = this.deleteImage.bind(this)
        this.getImageObj = this.getImageObj.bind(this)

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

		const urls = []
		const images = []

		snapshot.forEach(obj => {
			const url = this.storageRef.child(`${obj.key}/${obj.val().name}`).getDownloadURL()
			urls.push(url)
			images.push(Object.assign({id: obj.key}, obj.val()))
		})

		Promise.all(urls.map(promise => promise.catch(err => this.handleLoadImagesErrors(err, images)))).then(urls => {
			this.setState({
				images: urls.reduce((acc, url, index) => (
                    url !== undefined ? [...acc, Object.assign(images[index], {url: url})] : [...acc]
                ), [])
			})
		})
	}

    handleLoadImagesErrors(err, images) {

        const id = images.filter(obj => {
            const regex = new RegExp(obj.id, 'g');
            return err.message.match(regex)
        })[0].id

        // Delete DB entry if image ID doesn't exist in storage
        this.databaseRef.update({[id]: null})

        // Return undefined in order for Promise.All to resolve if one of the promises return an error
        return undefined
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
        const match = this.props.match

        console.log(this.state.images);

		return (
			<div className="gallery">
				<main className="grid">
                    {
                        this.state.images.map((imageObj, index) => (
                            <div className="grid__col" key={index}>
                                <Link to={`${match.url}/${imageObj.id}`}>
                                    <img id={imageObj.id} className="image" src={imageObj.url} alt={imageObj.name} key={index} />
                                </Link>
                            </div>
                        ))
                    }
                    <Route path={`${match.url}/:id`} render={props => <Painting {...props} getImageObj={this.getImageObj} />} />
				</main>
			</div>
		);
	}
}
