const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase)

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.MakeDbEntry = functions.storage.bucket('nechristiansen-7ad6d').object().onChange(event  => {

    if (event.data.resourceState === 'not_exists' || event.data.metageneration > 1) {
        console.log('Either image exists, or event is a deletion')
        return
    }

    console.log(event)

    return admin.database().ref(`images/${event.data.metadata.id}`).set({
        name : event.data.metadata.name
    })

})
