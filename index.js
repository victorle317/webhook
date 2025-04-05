require('dotenv').config();
const express = require('express');
var {connect} = require('mongoose');
const verifyWebhookSignature = require('./verifyWebhook');
const { saveOutputToSpaces } = require('./services/storageService');
const cacheService = require('./services/cacheService');
const { Generation } = require('./model/generation');

const app = express();
const PORT = process.env.PORT || 3000;

//db connection
// Database connection configuration
const connectDB = async () => {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        autoIndex: true, // Build indexes
      };
  
      await connect(process.env.DB_URL);
      console.log('✅ Successfully connected to MongoDB.');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      // Exit process with failure if this is critical to your application
      process.exit(1);
    }
  };
  
  // Initialize database connection
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Webhook route
app.post('/webhook/replicate', verifyWebhookSignature, async (req, res) => {
    try {
        const webhookData = req.body;
        const predictionId = webhookData.id;

        console.log('Received webhook:', webhookData);

        // Find or create a Generation document
        let generation = await Generation.findOne({ predictionId });
        // if (!generation) {
        //     generation = new Generation({ 
        //         predictionId,
        //         status: webhookData.status,
        //         model: webhookData.model,
        //         replicateRawOutput: webhookData
        //     });
        // }

        switch (webhookData.status) {
            case 'starting':
                console.log('Prediction starting:', {
                    id: predictionId,
                    model: webhookData.model,
                    started_at: webhookData.started_at
                });
                await cacheService.updatePredictionStatus(predictionId, 'starting');
                
                // Update MongoDB
                generation.status = 'starting';
                generation.replicateRawOutput = webhookData;
                await generation.save();
                break;

            case 'processing':
                console.log('Prediction processing:', {
                    id: predictionId,
                    model: webhookData.model,
                    started_at: webhookData.started_at
                });
                // Update MongoDB
                generation.status = 'processing';
                generation.replicateRawOutput = webhookData;

                await generation.save();
                await cacheService.updatePredictionStatus(predictionId, 'processing',{
                    replicateRawOutput : webhookData,
                }); 
                
                break;

            case 'succeeded':
                const outputUrl = Array.isArray(webhookData.output)
                    ? webhookData.output[0]
                    : webhookData.output;

                if (outputUrl) {
                    try {
                        const spacesUrl = await saveOutputToSpaces(outputUrl, predictionId, webhookData.input.output_format);
                        console.log('Image saved to Spaces:', spacesUrl);
                        // Update MongoDB
                        generation.status = 'succeeded';
                        generation.url = spacesUrl;
                        generation.replicateUrl = outputUrl;
                        generation.replicateRawOutput = webhookData;

                        await generation.save();
                        await cacheService.updatePredictionStatus(predictionId, 'succeeded', {
                            url : spacesUrl,
                            replicateUrl : outputUrl,
                            replicateRawOutput : webhookData,
                            spacesUrl
                        });


                    } catch (storageError) {
                        console.error('Failed to save image to Spaces:', storageError);
                        // Update MongoDB with error
                        generation.status = 'succeeded_with_error';
                        generation.error = storageError.message;
                        generation.replicateUrl = outputUrl;
                        generation.replicateRawOutput = webhookData;
                        await generation.save();

                        await cacheService.updatePredictionStatus(predictionId, 'succeeded_with_error', {
                            output: webhookData.output,
                            error : storageError.message,
                            replicateUrl : outputUrl,
                            replicateRawOutput : webhookData,
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

                // Update MongoDB
                generation.status = 'failed';
                generation.error = webhookData.error;
                generation.replicateRawOutput = webhookData;
                await generation.save();
                break;

            case 'canceled':
                console.log('Prediction canceled:', {
                    id: predictionId,
                    model: webhookData.model
                });
                await cacheService.updatePredictionStatus(predictionId, 'canceled');

                // Update MongoDB
                generation.status = 'canceled';
                generation.replicateRawOutput = webhookData;
                await generation.save();
                break;

            default:
                console.log('Unknown prediction state:', webhookData);
                await cacheService.updatePredictionStatus(predictionId, 'unknown');

                // Update MongoDB
                generation.status = 'unknown';
                generation.replicateRawOutput = webhookData;
                await generation.save();
        }

        res.status(200).json({ detail: "Webhook received successfully" });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ detail: "Internal server error" });
    }
});

// Add endpoint to get prediction status
app.get('/:id', async (req, res) => {
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
app.get('/', async (req, res) => {
    try {
        const predictions = await cacheService.getAllPredictions();
        res.json(predictions);
    } catch (error) {
        console.error('Error fetching predictions:', error);
        res.status(500).json({ detail: "Internal server error" });
    }
});

// Add endpoint to get predictions by status
app.get('/status/:status', async (req, res) => {
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
app.delete('/:id', async (req, res) => {
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
// app.get('/:id/status', async (req, res) => {
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

// Add endpoint to purge all predictions
app.delete('/purge/all', async (req, res) => {
    try {
        const result = await cacheService.purgeAllPredictions();
        res.json(result);
    } catch (error) {
        console.error('Error purging all predictions:', error);
        res.status(500).json({
            success: false,
            message: "Failed to purge predictions",
            error: error.message
        });
    }
});

// Add endpoint to purge predictions by status
app.delete('/purge/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        const result = await cacheService.purgePredictionsByStatus(status);
        res.json(result);
    } catch (error) {
        console.error('Error purging predictions by status:', error);
        res.status(500).json({
            success: false,
            message: "Failed to purge predictions",
            error: error.message
        });
    }
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 