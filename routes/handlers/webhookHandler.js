const Generation = require('../../models/generation');
const cacheService = require('../../service/cacheService');
const { saveOutputToSpaces } = require('../../service/storage');

const formatVietnamTime = (utcTime) => {
    const date = new Date(utcTime);
    // Convert to Vietnam timezone (UTC+7)
    const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return vietnamTime.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

const webhookHandler = async (req, res) => {
    try {
        const webhookData = req.body;
        const predictionId = webhookData.id;

        console.log('Received webhook:', webhookData.id);

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
                    started_at: formatVietnamTime(webhookData.started_at)
                });
                // Update MongoDB
                generation.status = 'processing';
                generation.replicateRawOutput = webhookData;

                await generation.save();
                await cacheService.updatePredictionStatus(predictionId, 'processing', {
                    replicateRawOutput: webhookData,
                });

                break;

            case 'succeeded':
                const outputUrl = Array.isArray(webhookData.output)
                    ? webhookData.output[0]
                    : webhookData.output;
                let spacesUrl = null;
                if (outputUrl) {
                    try {
                        spacesUrl = await saveOutputToSpaces(outputUrl, predictionId, webhookData.input.output_format);
                        console.log('Image saved to Spaces:', spacesUrl);
                        // Update MongoDB
                        generation.status = 'succeeded';
                        generation.url = spacesUrl;
                        generation.replicateUrl = outputUrl;
                        generation.replicateRawOutput = webhookData;

                        await generation.save();
                        await cacheService.updatePredictionStatus(predictionId, 'succeeded', {
                            url: spacesUrl,
                            replicateUrl: outputUrl,
                            replicateRawOutput: webhookData,
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
                            error: storageError.message,
                            replicateUrl: outputUrl,
                            replicateRawOutput: webhookData,
                        });


                    }
                }


                console.log('Prediction succeeded:', {
                    id: predictionId,
                    model: webhookData.model,
                    spacesUrl: spacesUrl,
                    completed_at: formatVietnamTime(webhookData.completed_at)
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
}

module.exports = webhookHandler;
