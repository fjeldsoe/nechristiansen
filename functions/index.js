const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


exports.MakeDbEntry = functions.storage.bucket('nechristiansen-7ad6d').object().upload(file => {

    console.log(file);
    //functions.database.ref().push(event)

});
