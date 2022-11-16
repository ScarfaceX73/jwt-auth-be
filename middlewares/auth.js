const jwt = require('jsonwebtoken')
const path = require('path')
require('dotenv').config(path.join(__dirname, "../.env"))

const MongoClient = require('mongodb').MongoClient
const { ObjectId } = require("mongodb")

const uri = process.env.MONGODB_URL
const db = "auth_srini_jwt"
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function myAuthentication(req, res, next) {
    if (req?.headers?.cookie) {
        try {
            await client.connect()
            let userDBCollection = client.db(db).collection('users');
            let jwtToken = req.headers.cookie.slice(9)
            let verifiedUser = jwt.verify(jwtToken, process.env.JWT_RANDOM_KEY);
            let user = await userDBCollection.findOne({ _id: ObjectID(verifiedUser.user._id) });
            if (user) {
                next();
            } else {
                res.status(404).json({ message: "Authentication failed. Logout and try again" })
            }
        } catch (error) {
            res.status(500).json({ message: "Unknown error. Please try agin" })
        }
    }
    res.status(500).json({ message: "Invalid or missing cookie" })
}


module.exports = myAuthentication