// // a simple mongodb js client

// const mdb = require("mongodb");
// const client = mdb.MongoClient;

// require("dotenv").config();

// const state: any = {
//     conn: null
// };

// // build the connection string (server path)
// const connectionUrl = "mongodb://" + process.env.MONGO_HOST +
//     ":" +
//     process.env.MONGO_PORT +
//     "/" +
//     process.env.MONGO_DB;

// const collectionName = process.env.MONGO_COLLECTION;

// // connect to mongo server and store the connection object
// const connect = async function(url = connectionUrl) {
//     console.log(connectionUrl);
//     return new Promise((resolve, reject) => {
//         client.connect(url, { useNewUrlParser: true },function (err: any, resp: any) {
//             if (!err) {
//                 console.log("Connected to MongoDB server", url);
//                 state.conn = resp;
//                 resolve(true);
//             } else {
//                 reject(err);
//             }
//         });
//     });
// };

// // close the connection
// function close () {
//     state.conn.close();
// }

// // insert an object
// const insert = async function(data: any) {
//     if(!state.conn) {
//         await connect();
//     }

//     const db = state.conn.db(process.env.MONGO_DB);
//     await db.collection(collectionName).insertOne(data);
// };

// module.exports = { connect, close, insert };

