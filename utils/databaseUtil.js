const mongo = require('mongodb');


const MongoClient = mongo.MongoClient;

const MONGO_URL = "mongodb+srv://bilalhyder:bilal@airbnb.3f7raqs.mongodb.net/?appName=airbnb";

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(MONGO_URL)
  .then(client => {
    callback();
    _db = client.db('airbnb');
  }).catch(err => {
    console.log('Error while connecting to Mongo: ', err);
  });
}

const getDb = () => {
  if (!_db) {
    throw new Error('Mongo not connected');
  }
  return _db;
}

module.exports = {
  mongoConnect,
  getDb
};