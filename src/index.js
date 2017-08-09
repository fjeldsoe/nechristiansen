import React from 'react'
import ReactDOM from 'react-dom'
import firebase from 'firebase/app'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import config from './config'

firebase.initializeApp(config.firebase)

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
