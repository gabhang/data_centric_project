const MongoClient = require('mongodb').MongoClient

var db
var coll

// connect to mongo database
MongoClient.connect('mongodb://localhost:27017')
    .then((client) => {
        db = client.db('lecturersDB')
        coll = db.collection('lecturer')
    })
    .catch((error) => {
        console.log(error.message)
    })

// function to get lecturer from database
function getLecturers() {
    return new Promise((resolve, reject) => {
        var cursor = coll.find().sort({ _id: 1 }) // get data and sort by id
        cursor.toArray()
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)

            })
    })
}

// function to insert student into database
function insertStudent(newStudent) {
    return new Promise((resolve, reject) => {
        coll.insertOne(newStudent)
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// export functions
module.exports = { getLecturers, insertStudent }