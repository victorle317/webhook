const express = require("express");
const router = express.Router();

const webhookHandler = require("./handlers/webhookHandler");
const { purgeAllCacheHandler, getAllCacheHandler, getCacheByIdHandler } = require("./handlers/cacheHandler");
const { generateHandler, getGenerationbyIdHandler, testGenerateByIdHandler,testGenerateHandler } = require("./handlers/generateHandler");

// const { generateImageQueue } = require("../queue/queue");

const verifyWebhookSignature = require("../middleware/verifyWebhookSignature");
// const rateLimiter = require("../middleware/rateLimiter");
const authenticate = require("../middleware/authenticate");

// const { validationResult } = require("express-validator");
// const {
//   validateGenerateReq,
//   validateShowReq,
// } = require("../validator/validators");

router.get("/", (req, res) => {
  res.status(200).json("ok");
});

// receive request and forward to replicate
router.post("/", authenticate, generateHandler);



//webhook route này sẽ dùng cho webhook post processing data, lưu ảnh S3
router.post("/webhook", verifyWebhookSignature, webhookHandler);

//get all cache
router.get("/cache", getAllCacheHandler);

//purge all cache
router.delete("/cache", purgeAllCacheHandler);

// Test generation with template ID
router.get("/test", authenticate, testGenerateByIdHandler);

// Test generation with user input
router.post("/test", authenticate, testGenerateHandler);

//get cache by id
router.get("/cache/:predictionId", getCacheByIdHandler);



// Get generation status
router.get("/:predictionId", authenticate, getGenerationbyIdHandler);

// Cần route get và set input dictionary

module.exports = router;
