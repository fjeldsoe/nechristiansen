const functions = require('firebase-functions')
const admin = require('firebase-admin')
const gcs = require('@google-cloud/storage')({
    projectId: 'nechristiansen-7ad6d',
    keyFilename: './nechristiansen-7ad6d-firebase-adminsdk-x0t6g-b04b4f9583.json'});
const spawn = require('child-process-promise').spawn;


admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://nechristiansen-7ad6d.firebaseio.com"
})

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

    return admin.database().ref(`images/${event.data.metadata.id}`).set({
        name: event.data.metadata.name
    })

})
