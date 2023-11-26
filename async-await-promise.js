const { MongoClient } = require("mongodb");
const url = "mongodb://127.0.0.1:27017/";

function connectToMongoDB() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
      if (err) {
        reject(err);
      } else {
        resolve(client);
      }
    });
  });
}

function findDocuments(collection, limit) {
  return new Promise((resolve, reject) => {
    collection
      .find({})
      .limit(limit)
      .toArray((err, documents) => {
        if (err) {
          reject(err);
        } else {
          resolve(documents);
        }
      });
  });
}

function closeMongoDBConnection(client) {
  return new Promise((resolve, reject) => {
    client.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function findAll() {
  try {
    const client = await connectToMongoDB();
    console.log("1");
    const db = client.db("mydb");
    console.log("2");
    const collection = db.collection("customers");
    console.log("3");

    const documents = await findDocuments(collection, 10);
    console.log("4");
    console.log(documents);
    console.log("5");

    await closeMongoDBConnection(client);
  } catch (err) {
    console.log("Error:", err);
  }
}

setTimeout(() => {
  findAll();
  console.log("iter");
}, 5000);
