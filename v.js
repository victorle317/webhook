const { validateWebhook } = require('replicate');

// Express middleware function
const verifyWebhookSignature = async (req, res, next) => {
    const secret = process.env.REPLICATE_WEBHOOK_SECRET;

    // Use a default host if req.get('host') is undefined
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

    try {
        // Construct Request object from Express request
        const request = new Request(fullUrl, {
            method: req.method,
            headers: new Headers(req.headers),
            body: JSON.stringify(req.body)
        });

        // Validate the webhook using Replicate's official function
        const isValid = await validateWebhook(
            request,
            secret
        );

        if (!isValid) {
            console.log("Webhook is invalid");
            return res.status(401).json({ detail: "Invalid webhook signature" });
        }

        console.log("Webhook is valid!");
        next(); // Proceed to next middleware/route handler

    } catch (error) {
        console.error('Error validating webhook:', error);
        return res.status(500).json({ detail: "Error validating webhook" });
    }
};

// var body = {
//     "created_at": "2025-03-19T08:55:25.482Z",
//     "data_removed": false,
//     "error": null,
//     "id": "2rpxhqtt59rm80cnnpern04z9g",
//     "input": {
//       "aspect_ratio": "1:1",
//       "extra_lora_scale": 1,
//       "go_fast": false,
//       "guidance_scale": 3,
//       "lora_scale": 1,
//       "megapixels": "1",
//       "model": "dev",
//       "num_inference_steps": 28,
//       "num_outputs": 1,
//       "output_format": "png",
//       "output_quality": 80,
//       "prompt": "tok a photo full body of a very fat old asian man with beard wear tok style of dark red color clothing, knee level long shirt, white pants, rainbow color sandle, wearing black hat in front of a faraway french paris eiffel tower",
//       "prompt_strength": 0.8,
//       "replicate_weights": "https://replicate.delivery/yhqm/v9ze8QDvH3Woe0NJzGpaffzQnq6DWNvhoUiAaGKgHgv0Fc2OB/trained_model.tar"
//     },
//     "logs": "",
//     "model": "victorle317/nguthan",
//     "output": null,
//     "started_at": "2025-03-19T08:55:29.078934042Z",
//     "status": "processing",
//     "urls": {
//       "cancel": "https://api.replicate.com/v1/predictions/2rpxhqtt59rm80cnnpern04z9g/cancel",
//       "get": "https://api.replicate.com/v1/predictions/2rpxhqtt59rm80cnnpern04z9g",
//       "stream": "https://stream.replicate.com/v1/files/bcwr-ceelkurbtfotlb2yy5biayscqe7tdxbygwmouedrojel6zku6vuq"
//     },
//     "version": "00557fbf5516ba75a4373b566ae9fa307925bf0d0d14445d794aa3993dc8d75d",
//     "webhook": "https://webhook.site/12eaf650-e279-42ac-9872-02a21502da74",
//     "webhook_events_filter": [
//       "start",
//       "completed"
//     ]
//   }

module.exports = verifyWebhookSignature;