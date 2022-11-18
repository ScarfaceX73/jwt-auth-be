var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config(path.join(__dirname, "../.env"));
var bcrypt = require("bcrypt");

const MongoClient = require("mongodb").MongoClient;
const cookie = require("cookie");
const sendMail = require("../services/sendmail");

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
      console.log(verifiedUser);
      let user = await userDBCollection.findOne({
        email: verifiedUser.user.email,
      });
      console.log(user);
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

router.get("/logout", async (_req, res) => {
  try {
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Expose-Headers", "Set-Cookie");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Set-Cookie");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("jwtToken", null, {
        httpOnly: true,
        maxAge: 3600,
        sameSite: "none",
        secure: true,
      })
    );
    res.status(200).json({ message: "logout successful" });
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
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
            maxAge: 3600,
            sameSite: "none",
            secure: true,
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
        .status(401)
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
      const resp = sendMail(user.email)
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

router.post("/shortUrls", async (req, res) => {
  try {
    await shortUrl.create({ full: req.body.fullUrl })
    res.redirect("http://localhost:3001/url")
  } catch (error) {
    res.status(500).json({ message: "Some error... I don't know" });
  }
})

router.get("/getShortUrls", async (req, res) => {
  await client.connect();
  let urlDBCollection = client.db(db).collection("short_urls");
  try {
    let shortUrl = await urlDBCollection.findOne({
      full: req.body.fullUrl,
    }).toArray();
    res.send(shortUrl);
    res.redirect("http://localhost:3001/url")
  } catch (error) {
    res.status(500).json({ message: "Some error... I don't know" });
  }
})




module.exports = router;
