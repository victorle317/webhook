require('dotenv').config();
const express = require('express');
const verifyWebhookSignature = require('./verifyWebhook');
const { saveOutputToSpaces } = require('./services/storageService');
const cacheService = require('./services/cacheService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Webhook route
app.post('/webhook/replicate', verifyWebhookSignature, async (req, res) => {
    try {
        // Get the webhook data from request body
        const webhookData = req.body;
        const predictionId = webhookData.id;

        // Log the webhook data
        console.log('Received webhook:', webhookData);



        // Handle different prediction states based on Replicate's standard status values
        switch (webhookData.status) {
            case 'starting':
                console.log('Prediction starting:', {
                    id: predictionId,
                    model: webhookData.model,
                    started_at: webhookData.started_at
                });
                await cacheService.updatePredictionStatus(predictionId, 'starting');
                break;

            case 'processing':
                console.log('Prediction processing:', {
                    id: predictionId,
                    model: webhookData.model,
                    started_at: webhookData.started_at
                });
                await cacheService.updatePredictionStatus(predictionId, 'processing');
                break;

            case 'succeeded':
                // Handle completed prediction with file saving
                const outputUrl = Array.isArray(webhookData.output)
                    ? webhookData.output[0]  // If output is an array, take first item
                    : webhookData.output;    // If output is a single URL

                if (outputUrl) {
                    try {
                        const spacesUrl = await saveOutputToSpaces(outputUrl, predictionId);
                        console.log('Image saved to Spaces:', spacesUrl);
                        // Update cache with spaces URL
                        // save all data to redis
                        await cacheService.updatePredictionStatus(predictionId, 'succeeded', {
                            ...webhookData,
                            spacesUrl
                        });
                    } catch (storageError) {
                        console.error('Failed to save image to Spaces:', storageError);
                        await cacheService.updatePredictionStatus(predictionId, 'succeeded_with_error', {
                            output: webhookData.output,
                            storageError: storageError.message
                        });
                    }
                }

                console.log('Prediction succeeded:', {
                    id: predictionId,
                    model: webhookData.model,
                    output: webhookData.output,
                    input: webhookData.input
                });
                break;

            case 'failed':
                console.log('Prediction failed:', webhookData.error);
                await cacheService.updatePredictionStatus(predictionId, 'failed', {
                    error: webhookData.error
                });
                break;

            case 'canceled':
                console.log('Prediction canceled:', {
                    id: predictionId,
                    model: webhookData.model
                });
                await cacheService.updatePredictionStatus(predictionId, 'canceled');
                break;

            default:
                console.log('Unknown prediction state:', webhookData);
                await cacheService.updatePredictionStatus(predictionId, 'unknown');
        }

        // Send success response
        res.status(200).json({ detail: "Webhook received successfully" });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ detail: "Internal server error" });
    }
});

// Add endpoint to get prediction status
app.get('/predictions/:id', async (req, res) => {
    try {
        const predictionId = req.params.id;
        const prediction = await cacheService.getPrediction(predictionId);

        if (!prediction) {
            return res.status(404).json({ detail: "Prediction not found" });
        }

        res.json(prediction);
    } catch (error) {
        console.error('Error fetching prediction:', error);
        res.status(500).json({ detail: "Internal server error" });
    }
});

// Add endpoint to get all predictions
app.get('/predictions', async (req, res) => {
    try {
        const predictions = await cacheService.getAllPredictions();
        res.json(predictions);
    } catch (error) {
        console.error('Error fetching predictions:', error);
        res.status(500).json({ detail: "Internal server error" });
    }
});

// Add endpoint to get predictions by status
app.get('/predictions/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        const predictions = await cacheService.getPredictionsByStatus(status);
        res.json(predictions);
    } catch (error) {
        console.error('Error fetching predictions by status:', error);
        res.status(500).json({ detail: "Internal server error" });
    }
});

// Add endpoint to delete prediction
app.delete('/predictions/:id', async (req, res) => {
    try {
        const predictionId = req.params.id;
        await cacheService.deletePrediction(predictionId);
        res.json({ detail: "Prediction deleted successfully" });
    } catch (error) {
        console.error('Error deleting prediction:', error);
        res.status(500).json({ detail: "Internal server error" });
    }
});

// Add endpoint to check prediction status
// app.get('/predictions/:id/status', async (req, res) => {
//     try {
//         const predictionId = req.params.id;
//         const statusInfo = await cacheService.checkPredictionStatus(predictionId);

//         if (!statusInfo.exists) {
//             return res.status(404).json(statusInfo);
//         }

//         res.json(statusInfo);
//     } catch (error) {
//         console.error('Error checking prediction status:', error);
//         res.status(500).json({ detail: "Internal server error" });
//     }
// });

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 