require('dotenv').config();
const express = require('express');
const verifyWebhookSignature = require('./v');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());



// Webhook route
app.post('/webhook/replicate', verifyWebhookSignature, (req, res) => {
    try {
        // Get the webhook data from request body
        const webhookData = req.body;

        // Log the webhook data
        console.log('Received webhook:', webhookData);
        console.log(JSON.stringify(webhookData, null, 2));
        

        // Handle different prediction states
        if (webhookData.error) {
            // Handle failed prediction
            console.log('Prediction failed:', webhookData.error);
        } else if (webhookData.output !== null) {
            // Handle completed prediction
            console.log('Prediction completed:', {
                id: webhookData.id,
                model: webhookData.model,
                output: webhookData.output,
                input: webhookData.input
            });
        } else if (webhookData.status === 'processing') {
            // Handle processing status
            console.log('Prediction processing:', {
                id: webhookData.id,
                model: webhookData.model,
                started_at: webhookData.started_at
            });
        } else {
            console.log('Unknown prediction state:', webhookData);
        }

        // Send success response
        res.status(200).json({ detail: "Webhook received successfully" });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ detail: "Internal server error" });
    }
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 