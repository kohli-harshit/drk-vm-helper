const os = require('os')
const retry = require('retry')
const mongodb = require('mongodb')
const username = require('username')
const moment = require('moment')

const url = 'mongodb://noi-qa-jenkins:27017/drk-db';
const collection_name='vm-loggedin-details';
const mongoClient = mongodb.MongoClient
const currentTime = new Date()
const currentHost=os.hostname()
const operation = retry.operation()


exports.dbEntryTask = (taskType) => {
    const operation = retry.operation()
    username().then(user => {
        operation.attempt(function (currentAttempt) {
            console.log(currentAttempt)
            mongoClient.connect(url, (err, db) => {
                if (operation.retry(err)) return
                const vmDetailsCollection = db.collection(collection_name)

                var now = moment()
                var formattedTime = now.format('YYYY-MM-DD HH:mm:ss Z')
                var currentHostDocument = vmDetailsCollection.findOne({'hostName':currentHost}).then(function(doc) {
                    if(doc)
                    {
                        console.log('Record found. Updating...');
                        vmDetailsCollection.update(
                            {_id:doc._id},
                            {$set:{
                                hostName: currentHost,
                                updated_on: formattedTime,
                                status:taskType
                            }},dbOperationFinished);                        
                    }
                    else
                    {
                        console.log('No record found.Inserting...');
                        vmDetailsCollection.insert({
                            userName: user,
                            updated_on: formattedTime,
                            hostName: currentHost,
                            status:taskType
                        },dbOperationFinished)
                    }
                });

                var dbOperationFinished = function(){
                    db.close();    
                }
            })
        })
    })
}