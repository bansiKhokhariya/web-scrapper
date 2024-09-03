const { MongoClient } = require('mongodb');

let client;
let clientPromise;

const CONNECTION_STRING = 'mongodb+srv://bansikhokhariya59:bansi%401234@cluster0.ilv8gsk.mongodb.net'

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(CONNECTION_STRING);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(CONNECTION_STRING);
    clientPromise = client.connect();
}

module.exports = clientPromise;
