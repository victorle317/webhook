var express = require('express');
var router = express.Router();
var rateLimiter = require('../middleware/rateLimiter');

/* GET users listing. */
router.get('/', async function (req, res) {
  res.status(200).json("ok");
});

router.get('/ip', rateLimiter, (request, response) => response.send(request.ip))

module.exports = router;
