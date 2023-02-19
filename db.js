const mongoose = require('mongoose');

const mongoUri = "mongodb://localhost:27017/mynotebook";

const connectToMongo = () => {
    mongoose.connect(mongoUri, () => {
        console.log("connected to database");
    })
}

module.exports = connectToMongo;