const os = require('os')
const retry = require('retry')
const mongodb = require('mongodb')
const username = require('username')

const devUrl = 'mongodb://mongodbtrigger:password@ds161580.mlab.com:61580/mongodbtrigger'
const prodUrl = 'mongodb://localhost:27017/history'

const url = process.env.NODE_ENV === "production" ? prodUrl : devUrl

const mongoClient = mongodb.MongoClient
const currentTime = new Date()

exports.dbEntryTask = (taskType) => {
    const operation = retry.operation()
    username().then(user => {
        operation.attempt(function (currentAttempt) {
            console.log(currentAttempt)
            mongoClient.connect(url, (err, db) => {
                if (operation.retry(err)) return
                const task = db.collection(taskType)
                task.insert({
                    userName: user,
                    taskTime: currentTime,
					hostName: os.hostname()
                })
                db.close()
            })
        })
    })
}