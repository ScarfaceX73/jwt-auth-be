var express = require('express');
const myAuthentication = require('../middlewares/auth');
var router = express.Router();
const path = require("path");
const shortid = require('shortid');
require("dotenv").config(path.join(__dirname, "../.env"));
const MongoClient = require("mongodb").MongoClient;

const uri = process.env.MONGODB_URL;
const db = "auth_srini_jwt";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

/* GET users listing. */
// router.use(myAuthentication)

router.get('/', async (req, res, next) => {
    try {
        await client.connect();
        let urlDBCollection = client.db(db).collection("urls");
        let data = await urlDBCollection.find().toArray()
        res.status(200).json({ data })
    } catch (error) {
        res.status(500).json({ message: "Unknown error occured. Contact admin" });

    }
})

router.post("/add", async (req, res) => {
    try {
        await client.connect();
        let urlDBCollection = client.db(db).collection("urls");
        let url = await urlDBCollection.findOne({
            link: req.body.link,
        });
        if (!url) {
            const doc = {
                link: req.body.link,
                short_id: shortid.generate(),
                count: 0
            }
            const insertion = await urlDBCollection.insertOne(doc)
            if (insertion.acknowledged) {
                res.status(200).json({
                    message: "doc inserted",
                });
            }
        } else {
            res
                .status(401)
                .json({ message: "URL exists" });
        }
    } catch (error) {
        res.status(500).json({ message: "Unknown error occured. Contact admin" });
    }
})

router.get("/:shortId", async (req, res) => {
    try {
        const idShort = req?.params?.shortId
        let urlDBCollection = client.db(db).collection("urls");
        let url = await urlDBCollection.findOne({
            short_id: idShort,
        });
        await urlDBCollection.updateOne({ short_id: idShort }, { $set: { count: url.count + 1 } })
        res.status(200).send()
    } catch (error) {
        res.status(500).json({ message: "Unknown error occured. Contact admin" });
    }
})


module.exports = router;