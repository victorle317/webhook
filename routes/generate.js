const express = require("express");
const router = express.Router();
const replicate = require("../service/replicate");
const cacheService = require("../service/cacheService");
const { InputTemplate } = require("../models/inputTemplate");
const  Generation  = require("../models/generation");


const webhookHandler = require("./handlers/webhookHandler");
const { purgeAllCacheHandler, getAllCacheHandler, getCacheByIdHandler } = require("./handlers/cacheHandler");
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
router.post("/", authenticate, async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   console.log(errors.array());
  //   return res.status(200).json({
  //     messages: [{ text: `sai payload` }]
  //   });
  // }
  console.log(req.body.isDebug);

  let {
    model,
    version,
    lora_weights,
    prompt,
    aspect_ratio,
    output_quality,
    output_format,
    prompt_strength,
    lora_scale,
    num_inference_steps,
    guidance_scale
  } = '';
  let go_fast = false;
  // cần có function để convert payload prompt của các admin thành các model, version và lora weight link tương ứng
  if (req.body.isDebug == "true") {
    // query random inputTemplate
    console.log("querying random inputTemplate");

    let inputTemplate = await InputTemplate.find({});

    // filter out by gender using classification field
    if(req.body.gender) inputTemplate = inputTemplate.filter(item => item.classification.gender.includes(req.body.gender));
    //filter out by clothing_type using classification field
    if(req.body.clothing_type) inputTemplate = inputTemplate.filter(item => item.classification.clothing_type.includes(req.body.clothing_type));
    //filter out by background using classification field
    if(req.body.background) inputTemplate = inputTemplate.filter(item => item.classification.background.includes(req.body.background));
    //filter out by style using classification field
    if(req.body.style) inputTemplate = inputTemplate.filter(item => item.classification.style.includes(req.body.style));

    //randomly select one inputTemplate
    inputTemplate = inputTemplate[Math.floor(Math.random() * inputTemplate.length)];


    //mapping inputTemplate to the correct field name
    model = inputTemplate.model;
    version = inputTemplate.version;
    lora_weights = inputTemplate.weightUrl;
    prompt = inputTemplate.prompt;
    aspect_ratio = inputTemplate.aspect_ratio;
    output_quality = inputTemplate.output_quality;
    output_format = inputTemplate.output_format;
    prompt_strength = inputTemplate.prompt_strength;
    lora_scale = inputTemplate.lora_scale;
    num_inference_steps = inputTemplate.num_inference_steps;
    guidance_scale = inputTemplate.guidance_scale;
    go_fast = inputTemplate.go_fast;
  }

  // Nhập options từ FrontEnd (style cụ thể hoặc random)
  //build prompt

  // Tạo Payload
  // tuỳ vào option đẩy lên mà tạo payload tương ứng cho implement dần dần
  let payload = {
    input: "",
    model: "",
    version: ""
  };

  //transform payload
  if (version == "") {
    // shakker
    payload.model = "black-forest-labs/flux-dev-lora"
    payload.version = ""
    payload.input = {
      prompt: prompt,
      go_fast: go_fast,
      guidance: guidance_scale,
      lora_scale: lora_scale,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: aspect_ratio,
      lora_weights: lora_weights,
      output_format: output_format,
      output_quality: output_quality,
      prompt_strength: prompt_strength,
      num_inference_steps: num_inference_steps
    };
  } else {
    //internal trained model
    payload.model = model
    payload.version = version
    payload.input = {
      model: "dev",
      prompt: prompt,
      go_fast: go_fast,
      lora_scale: lora_scale,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: aspect_ratio,
      output_format: output_format,
      guidance_scale: guidance_scale,
      output_quality: output_quality,
      prompt_strength: prompt_strength,
      extra_lora_scale: 1,
      num_inference_steps: num_inference_steps
    }
  }
  console.log(payload);

  try {
    // Gọi API replicate
    const prediction = await replicate.predictions.create({
      model: payload.model,
      version: payload.version,
      input: payload.input,
      webhook: `${process.env.MASTER_SERVER_ADDR}/generate/webhook`,
      webhook_events_filter: ["start", "completed"], // optional
    });

    // cache to redis
    const newGeneration = new Generation({
      predictionId: prediction.id,
      status: prediction.status,
      prompt: prompt,
      model: model,
      weightUrl: lora_weights || "",
      chosenSettings: payload.input,
      replicateRawOutput: prediction,
    });
    await newGeneration.save();
    await cacheService.setPrediction(newGeneration.predictionId, newGeneration.toObject());
  



    res.status(201).json({
      status: "success",
      prediction_id: prediction.id,
      statusUrl: `${process.env.MASTER_SERVER_ADDR}/generate/${prediction.id}`, // use for polling status
    });
    //Note: Extract user data ra 1 object
    //check URL valid
    //Note: Build prompt
    // If user not exist, create new user
    // Limit players turns
    // Create new job._id for Master Node control
    // const newJobId = new mongoose.Types.ObjectId();
    // const jobOptions = {
    //   removeOnComplete: true,
    //   removeOnFail: true,
    //   timeout: 1000 * 60 * 3.5, // 3.5 minutes
    // };
    // //Note:delete prompt in the future
    // generateImageQueue.add(
    //   {
    //   },
    //   jobOptions
    // );
    // //Note : Send queue statistic to client "you are in queue, there are x people in front of you"
    // let waitCount = await generateImageQueue.getWaitingCount()
    // let activeCount = await generateImageQueue.getActiveCount()
    // let queueCount = waitCount + activeCount - 1
    // res.status(200).json({
    //   "messages": [
    //     // {"text": `Đang xử lý yêu cầu của bạn, có ${queueCount} người đang xếp hàng, xin vui lòng chờ giây lát!`},
    //     { "typing": 3000 } // Add this line
    //   ],
    //   "set_attributes":
    //   {
    //     "current_job": `${newJob._id}`,
    //     "mess_id": `${userPostData.mess_id}`,
    //     "exist": "false"
    //   },
    //   "debug": {
    //     "url": `${process.env.MASTER_SERVER_ADDR}/generate/` + userPostData.mess_id + "/" + newJob._id,
    //     "queueCount": `${queueCount}`,
    //   }
    // })
  } catch (error) {
    console.log(error);

    res.status(200).json({
      messages: [{ text: `Đã có lỗi trong quá trình xử lý, vui lòng thử lại` }]
    });
  }
});

//webhook route này sẽ dùng cho webhook post processing data, lưu ảnh S3
router.post("/webhook", verifyWebhookSignature, webhookHandler);

//get all cache
router.get("/cache", getAllCacheHandler);

//purge all cache
router.delete("/cache", purgeAllCacheHandler);

//get cache by id
router.get("/cache/:predictionId", getCacheByIdHandler);


// Get generation status
router.get("/:predictionId", async (req, res) => {
  try {
    const predictionId = req.params.predictionId;

    // First check cache
    let prediction = await cacheService.getPrediction(predictionId);



    // If not in cache, check database
    if (!prediction) {
      console.log("Prediction not found in cache, checking database");
      const generationFromDB = await Generation.findOne({ predictionId });

      if (generationFromDB) {
        prediction = generationFromDB;
        // Cache the found prediction for future requests
        
      } else {
        return res.status(404).json({ detail: "Prediction not found in cache or database" });
      }
    }

      res.status(200).json(prediction);
   


  } catch (error) {
    console.error('Error fetching prediction:', error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Cần route get và set input dictionary


module.exports = router;
