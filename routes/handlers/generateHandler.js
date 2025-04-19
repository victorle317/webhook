const replicate = require("../../service/replicate");
const { InputTemplate } = require("../../models/inputTemplate.js");
const Generation = require("../../models/generation.js");
const cacheService = require("../../service/cacheService.js");

const generateHandler = async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   console.log(errors.array());
  //   return res.status(200).json({
  //     messages: [{ text: `sai payload` }]
  //   });
  // }

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
    guidance_scale,
    modelName,
    image
  } = '';
  let go_fast = false;
  let userInput = {
    gender: [],
    clothing_type: [],
    background: [],
    style: []
  }
  // cần có function để convert payload prompt của các admin thành các model, version và lora weight link tương ứng
  if (true) {
    // query random inputTemplate
    console.log("querying random inputTemplate");
    // userInput = {
    //   gender: [...req.body.gender],
    //   clothing_type: [...req.body.clothing_type],
    //   background: [...req.body.background],
    //   style: [...req.body.style]
    // }
    let inputTemplate = await InputTemplate.find({});
    let temp = [...inputTemplate]

    // filter out by gender using classification field
    if (req.body.gender) {
      inputTemplate = inputTemplate.filter(item => item.classification.gender.includes(req.body.gender));
      userInput.gender.push(req.body.gender);
    }
    //filter out by clothing_type using classification field
    if (req.body.clothing_type) {
      inputTemplate = inputTemplate.filter(item => item.classification.clothing_type.includes(req.body.clothing_type));
      userInput.clothing_type.push(req.body.clothing_type);
    }
    //filter out by background using classification field
    if (req.body.background) {
      inputTemplate = inputTemplate.filter(item => item.classification.background.includes(req.body.background));
      userInput.background.push(req.body.background);
    }
    //filter out by style using classification field
    if (req.body.style) {
      inputTemplate = inputTemplate.filter(item => item.classification.style.includes(req.body.style));
      userInput.style.push(req.body.style);
    }

    //randomly select one inputTemplate
    inputTemplate = inputTemplate[Math.floor(Math.random() * inputTemplate.length)];

    if (!inputTemplate) {
      inputTemplate = temp[Math.floor(Math.random() * temp.length)];
    }
    //mapping inputTemplate to the correct field name
    // handle if inputTemplate.modelName is return cannot read property of undefined
    modelName = inputTemplate.modelName ;
    model = inputTemplate.model ;
    version = inputTemplate.version ;
    lora_weights = inputTemplate.weightUrl ;
    prompt = inputTemplate.prompt ;
    aspect_ratio = inputTemplate.aspect_ratio ;
    output_quality = inputTemplate.output_quality ;
    output_format = inputTemplate.output_format;
    prompt_strength = inputTemplate.prompt_strength;
    lora_scale = inputTemplate.lora_scale;
    num_inference_steps = inputTemplate.num_inference_steps;
    guidance_scale = inputTemplate.guidance_scale;
    go_fast = inputTemplate.go_fast;
    extra_lora = inputTemplate.extra_lora;
    extra_lora_scale = inputTemplate.extra_lora_scale;
    image = inputTemplate.image ;
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
      image: image,
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
      image: image,
      model: "dev",
      prompt: prompt,
      extra_lora: extra_lora,
      extra_lora_scale: extra_lora_scale,
      go_fast: go_fast,
      lora_scale: lora_scale,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: aspect_ratio,
      output_format: output_format,
      guidance_scale: guidance_scale,
      output_quality: output_quality,
      prompt_strength: prompt_strength,
      num_inference_steps: num_inference_steps
    }
  }

  if (!extra_lora) {
    delete payload.input.extra_lora;
    delete payload.input.extra_lora_scale;
  }

  if (image == "") {
    delete payload.input.image;
  }

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
      modelName: modelName,
      userInput: userInput,
      predictionId: prediction.id,
      status: prediction.status,
      prompt: prompt,
      extra_lora: extra_lora,
      extra_lora_scale: extra_lora_scale,
      model: model,
      image: image,
      weightUrl: lora_weights || "",
      chosenSettings: payload.input,
      replicateRawOutput: prediction,
    });
    await newGeneration.save();
    await cacheService.setPrediction(newGeneration.predictionId, newGeneration.toObject());




    res.status(201).json({
      status: "success",
      generation_id: prediction.id,
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
    console.error('Error in generateHandler:', error);
    res.status(500).json({
      status: 'Error',
      error: 'Error generating image'
    });
  }
}
const getGenerationbyIdHandler = async (req, res) => {
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
        return res.status(404).json({
          status: 'Error',
          error: 'Generation not found'
        });
      }
    }

    if (req.isAdmin) {
      res.status(200).json(prediction);
    } else {
      res.status(200).json(Generation.reduceFields(prediction));
    }

  } catch (error) {
    console.error('Error in getGenerationbyIdHandler:', error);
    res.status(500).json({
      status: 'Error',
      error: 'Error fetching getGenerationbyIdHandler'
    });
  }
}

const testGenerateByIdHandler = async (req, res) => {
  try {
    const { template_id } = req.query;

    if (!template_id) {
      return res.status(400).json({
        status: 'Error',
        error: 'template_id is required'
      });
    }

    // Get the input template
    const inputTemplate = await InputTemplate.findById(template_id);
    if (!inputTemplate) {
      return res.status(404).json({
        status: 'Error',
        error: 'Template not found'
      });
    }

    // Prepare payload based on template
    let payload = {
      input: "",
      model: "",
      version: ""
    };

    if (inputTemplate.version === "") {
      // shakker
      payload.model = "black-forest-labs/flux-dev-lora";
      payload.version = "";
      payload.input = {
        image: inputTemplate.image || "",
        prompt: inputTemplate.prompt,
        go_fast: inputTemplate.go_fast,
        guidance: inputTemplate.guidance_scale,
        lora_scale: inputTemplate.lora_scale,
        megapixels: "1",
        num_outputs: 1,
        aspect_ratio: inputTemplate.aspect_ratio,
        lora_weights: inputTemplate.weightUrl,
        output_format: inputTemplate.output_format,
        output_quality: inputTemplate.output_quality,
        prompt_strength: inputTemplate.prompt_strength,
        num_inference_steps: inputTemplate.num_inference_steps
      };
    } else {
      // internal trained model
      payload.model = inputTemplate.model;
      payload.version = inputTemplate.version;
      payload.input = {
        image: inputTemplate.image || "",
        model: "dev",
        prompt: inputTemplate.prompt,
        go_fast: inputTemplate.go_fast,
        lora_scale: inputTemplate.lora_scale,
        megapixels: "1",
        num_outputs: 1,
        aspect_ratio: inputTemplate.aspect_ratio,
        output_format: inputTemplate.output_format,
        guidance_scale: inputTemplate.guidance_scale,
        output_quality: inputTemplate.output_quality,
        prompt_strength: inputTemplate.prompt_strength,
        extra_lora: inputTemplate.extra_lora,
        extra_lora_scale: inputTemplate.extra_lora_scale,
        num_inference_steps: inputTemplate.num_inference_steps
      };
    }
    if (!inputTemplate.extra_lora) {
      delete payload.input.extra_lora;
      delete payload.input.extra_lora_scale;
    }
    if (!inputTemplate.image) {
      delete payload.input.image;
    }

    // Call replicate API
    const prediction = await replicate.predictions.create({
      model: payload.model,
      version: payload.version,
      input: payload.input,
      webhook: `${process.env.MASTER_SERVER_ADDR}/generate/webhook`,
      webhook_events_filter: ["start", "completed"]
    });

    // Save to database and cache
    const newGeneration = new Generation({
      modelName: inputTemplate.modelName || "",
      predictionId: prediction.id,
      status: prediction.status,
      prompt: inputTemplate.prompt,
      model: inputTemplate.model || "",
      image: inputTemplate.image || "",
      weightUrl: inputTemplate.weightUrl || "",
      chosenSettings: payload.input,
      replicateRawOutput: prediction
    });

    await newGeneration.save();
    await cacheService.setPrediction(newGeneration.predictionId, newGeneration.toObject());

    res.status(201).json({
      status: "success",
      generation_id: prediction.id,
      statusUrl: `${process.env.MASTER_SERVER_ADDR}/generate/${prediction.id}`
    });

  } catch (error) {
    console.error('Error in testGenerateHandler:', error);
    res.status(500).json({
      status: 'Error',
      error: 'Error generating image'
    });
  }
}

const testGenerateHandler = async (req, res) => {
  try {
    const {
      modelName,
      image,
      classification,
      prompt,
      aspect_ratio,
      output_quality,
      output_format,
      prompt_strength,
      lora_scale,
      num_inference_steps,
      guidance_scale
    } = req.body;

    // Prepare userInput from classification
    const userInput = {
      gender: classification.gender || [],
      clothing_type: classification.clothing_type || [],
      background: classification.background || [],
      style: classification.style || []
    };

    // Prepare payload
    let payload = {
      input: "",
      model: "",
      version: ""
    };

    // Since this is a test handler, we'll use the model name directly
    payload.model = modelName;
    payload.version = ""; // Empty version for now

    // Prepare input parameters
    payload.input = {
      image: image || "",
      prompt: prompt,
      go_fast: false,
      guidance: guidance_scale,
      lora_scale: lora_scale,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: aspect_ratio,
      output_format: output_format,
      output_quality: output_quality,
      prompt_strength: prompt_strength,
      num_inference_steps: num_inference_steps
    };

    // Remove image if empty
    if (!image) {
      delete payload.input.image;
    }

    // Call replicate API
    const prediction = await replicate.predictions.create({
      model: payload.model,
      version: payload.version,
      input: payload.input,
      webhook: `${process.env.MASTER_SERVER_ADDR}/generate/webhook`,
      webhook_events_filter: ["start", "completed"]
    });

    // Save to database and cache
    const newGeneration = new Generation({
      modelName: modelName,
      userInput: userInput,
      predictionId: prediction.id,
      status: prediction.status,
      prompt: prompt,
      model: modelName,
      image: image || "",
      weightUrl: "",
      chosenSettings: payload.input,
      replicateRawOutput: prediction
    });

    await newGeneration.save();
    await cacheService.setPrediction(newGeneration.predictionId, newGeneration.toObject());

    res.status(201).json({
      status: "success",
      generation_id: prediction.id,
      statusUrl: `${process.env.MASTER_SERVER_ADDR}/generate/${prediction.id}`
    });

  } catch (error) {
    console.error('Error in testGenerateHandler:', error);
    res.status(500).json({
      status: 'Error',
      error: 'Error generating image'
    });
  }
};

module.exports = {
  generateHandler,
  getGenerationbyIdHandler,
  testGenerateByIdHandler,
  testGenerateHandler
};