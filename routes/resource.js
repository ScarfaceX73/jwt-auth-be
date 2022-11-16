var express = require('express');
const myAuthentication = require('../middlewares/auth');
var router = express.Router();

/* GET users listing. */
router.use(myAuthentication)

router.get('/', (req, res, next) => {
    res.status(200).json({ message: "you have access to resource" })
})

module.exports = router;