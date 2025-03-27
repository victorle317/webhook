const redisClient = require('./redisClient');

const PREDICTION_KEY_PREFIX = 'prediction:';
const ALL_PREDICTIONS_KEY = 'all_predictions';

const cacheService = {
    // Store prediction data
    setPrediction: async (predictionId, data) => {
        const key = `${PREDICTION_KEY_PREFIX}${predictionId}`;
        const predictionData = {
            ...data,
            lastUpdated: new Date().toISOString()
        };

        // Store individual prediction
        await redisClient.set(key, JSON.stringify(predictionData));

        // Add to set of all predictions
        await redisClient.sadd(ALL_PREDICTIONS_KEY, predictionId);

        return predictionData;
    },

    // Get prediction data
    getPrediction: async (predictionId) => {
        const key = `${PREDICTION_KEY_PREFIX}${predictionId}`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    },

    // Update prediction status
    updatePredictionStatus: async (predictionId, status, data = {}) => {
        const key = `${PREDICTION_KEY_PREFIX}${predictionId}`;
        const existingData = await cacheService.getPrediction(predictionId) || {};

        const updatedData = {
            ...existingData,
            ...data,
            status,
            lastUpdated: new Date().toISOString()
        };

        await redisClient.set(key, JSON.stringify(updatedData));
        return updatedData;
    },

    // Check if prediction exists
    hasPrediction: async (predictionId) => {
        const key = `${PREDICTION_KEY_PREFIX}${predictionId}`;
        return await redisClient.exists(key) === 1;
    },

    // Get all predictions
    getAllPredictions: async () => {
        const predictionIds = await redisClient.smembers(ALL_PREDICTIONS_KEY);
        const predictions = await Promise.all(
            predictionIds.map(async (id) => {
                const data = await cacheService.getPrediction(id);
                return {
                    id,
                    ...data
                };
            })
        );
        return predictions;
    },

    // Delete prediction
    deletePrediction: async (predictionId) => {
        const key = `${PREDICTION_KEY_PREFIX}${predictionId}`;
        await redisClient.del(key);
        await redisClient.srem(ALL_PREDICTIONS_KEY, predictionId);
    },

    // Get predictions by status
    getPredictionsByStatus: async (status) => {
        const predictions = await cacheService.getAllPredictions();
        return predictions.filter(pred => pred.status === status);
    },

    // Check prediction status with detailed information
    checkPredictionStatus: async (predictionId) => {
        const key = `${PREDICTION_KEY_PREFIX}${predictionId}`;
        const data = await redisClient.get(key);

        if (!data) {
            return {
                exists: false,
                message: 'Prediction not found'
            };
        }

        const prediction = JSON.parse(data);
        const now = new Date();
        const startedAt = new Date(prediction.started_at);
        const duration = now - startedAt;

        const statusInfo = {
            exists: true,
            id: predictionId,
            status: prediction.status,
            model: prediction.model,
            started_at: prediction.started_at,
            duration_ms: duration,
            duration_formatted: `${Math.floor(duration / 1000)}s ${duration % 1000}ms`,
            last_updated: prediction.lastUpdated,
            has_output: prediction.output !== null,
            has_error: !!prediction.error,
            has_spaces_url: !!prediction.spacesUrl
        };

        // Add status-specific information
        switch (prediction.status) {
            case 'starting':
                statusInfo.message = 'Prediction is starting';
                break;
            case 'processing':
                statusInfo.message = 'Prediction is currently processing';
                break;
            case 'succeeded':
                statusInfo.message = 'Prediction completed successfully';
                break;
            case 'succeeded_with_error':
                statusInfo.message = 'Prediction completed but storage failed';
                break;
            case 'failed':
                statusInfo.message = 'Prediction failed';
                statusInfo.error = prediction.error;
                break;
            case 'canceled':
                statusInfo.message = 'Prediction was canceled';
                break;
            default:
                statusInfo.message = 'Unknown prediction status';
        }

        // Add output information if available
        if (prediction.output) {
            statusInfo.output_type = Array.isArray(prediction.output) ? 'array' : 'single';
            statusInfo.output_count = Array.isArray(prediction.output) ? prediction.output.length : 1;
        }

        return statusInfo;
    }
};

module.exports = cacheService; 