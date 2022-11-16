var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config(path.join(__dirname, "../.env"));
var bcrypt = require("bcrypt");

const MongoClient = require("mongodb").MongoClient;
const cookie = require("cookie");

const uri = process.env.MONGODB_URL;
const db = "auth_srini_jwt";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/* GET users listing. */

router.get("/", async (req, res, next) => {
  try {
    await client.connect();
    let userDBCollection = client.db(db).collection("users");
    if (req.headers.cookie) {
      let jwtToken = req.headers.cookie.slice(9);
      let verifiedUser = jwt.verify(jwtToken, process.env.JWT_RANDOM_KEY);
      let user = await userDBCollection.findOne({
        _id: ObjectID(verifiedUser.user._id),
      });
      if (user) {
        res.status(200).json(user);
      } else {
        res.sendStatus(400);
      }
    } else {
      res.status(400).json({ message: "no cookie" });
    }
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  } finally {
    await client.close();
  }
});

router.post("/login", async function (req, res) {
  try {
    await client.connect();
    let userDBCollection = client.db(db).collection("users");
    let user = await userDBCollection.findOne({ email: req.body.email });
    if (user) {
      let compare = await bcrypt.compare(req.body.password, user.password);
      if (compare) {
        let jwtToken = jwt.sign({ user: user }, process.env.JWT_RANDOM_KEY, {
          expiresIn: 1800,
        });
        res.setHeader("Access-Control-Allow-Credentials", true);
        res.setHeader("Access-Control-Expose-Headers", "Set-Cookie");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Set-Cookie"
        );
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, OPTIONS, PUT, PATCH, DELETE"
        );
        res.setHeader(
          "Set-Cookie",
          cookie.serialize("jwtToken", jwtToken, {
            httpOnly: true,
            maxAge: 60 * 60,
            sameSite: "none",
            secure: true,
            domain: "localhost:3001",
          })
        );
        res.status(200).json(user);
      } else {
        res
          .status(500)
          .json({ message: "Invalid Credentials. Please try again" });
      }
    } else {
      res.status(500).json({ message: "No user found" });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  } finally {
    await client.close();
  }
});

router.post("/register", async function (req, res, next) {
  try {
    await client.connect();
    let userDBCollection = client.db(db).collection("users");
    let user = await userDBCollection.findOne({
      email: req.body.email,
    });
    if (!user) {
      let salt = await bcrypt.genSalt(10);
      let hashedPass = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPass;

      let insertion = await userDBCollection.insertOne(req.body);
      console.log(insertion);
      if (insertion.acknowledged) {
        res.status(200).json({
          message: "user inserted",
        });
      }
    } else {
      res
        .status(500)
        .json({ message: "User exists. Please try to recover your password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Unknown error occured. Contact admin" });
  } finally {
    await client.close();
  }
});

router.post("/forgot-password", async function (req, res, next) {
  try {
    await client.connect();
    let userDBCollection = client.db(db).collection("users");
    let user = await userDBCollection.findOne({
      email: req.body.email,
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      // send mail
      res.status(200).json({ message: "Check your mail to continue" });
    }
  } catch (error) {
    res.status(500).json({ message: "Unknown error occured. Contact admin" });
  } finally {
    await client.close();
  }
});

router.put("/reset-password", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
