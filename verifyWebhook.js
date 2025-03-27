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


module.exports = verifyWebhookSignature;