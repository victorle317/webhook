var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res) {
  res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // 1 hour
  res.sendFile('index.html');
});

module.exports = router;
