const { client: redisClient, checkConnection } = require('./redisClient');

const PREDICTION_KEY_PREFIX = 'prediction:';
const ALL_PREDICTIONS_KEY = 'all_predictions';

// Cache expiration times in seconds
const CACHE_EXPIRATION = {
    starting: 3600,      // 1 hour
    processing: 3600,    // 1 hour
    succeeded: 86400,    // 24 hours
    succeeded_with_error: 86400, // 24 hours
    failed: 86400,       // 24 hours
    canceled: 3600,      // 1 hour
    unknown: 3600        // 1 hour
};

// Helper function to ensure Redis connection
const ensureConnection = async () => {
    const isConnected = await checkConnection();
    if (!isConnected) {
        throw new Error('Redis connection failed');
    }
};

// Helper function to set expiration
const setExpiration = async (key, status) => {
    const expiration = CACHE_EXPIRATION[status] || CACHE_EXPIRATION.unknown;
    await redisClient.expire(key, expiration);
};

const cacheService = {
    // Store prediction data
    setPrediction: async (predictionId, data) => {
        try {
            await ensureConnection();
            const key = `${PREDICTION_KEY_PREFIX}${predictionId}`;
            const predictionData = {
                ...data,
                lastUpdated: new Date().toISOString()
            };

            // Store individual prediction
            await redisClient.set(key, JSON.stringify(predictionData));

            // Set expiration based on status
            await setExpiration(key, data.status || 'unknown');

            // Add to set of all predictions
            await redisClient.sadd(ALL_PREDICTIONS_KEY, predictionId);

            return predictionData;
        } catch (error) {
            console.error('[CacheService] Error setting prediction:', error);
            throw error;
        }
    },

    // Update prediction status
    updatePredictionStatus: async (predictionId, status, data = {}) => {
        try {
            await ensureConnection();
            const key = `${PREDICTION_KEY_PREFIX}${predictionId}`;
            const existingData = await cacheService.getPrediction(predictionId) || {};

            const updatedData = {
                ...existingData,
                ...data,
                status,
                lastUpdated: new Date().toISOString()
            };

            await redisClient.set(key, JSON.stringify(updatedData));

            // Update expiration based on new status
            await setExpiration(key, status);

            return updatedData;
        } catch (error) {
            console.error('[CacheService] Error updating prediction status:', error);
            throw error;
        }
    },

    // Get prediction data
    getPrediction: async (predictionId) => {
        try {
            await ensureConnection();
            const key = `${PREDICTION_KEY_PREFIX}${predictionId}`;
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('[CacheService] Error getting prediction:', error);
            throw error;
        }
    },

    // Check if prediction exists
    hasPrediction: async (predictionId) => {
        try {
            await ensureConnection();
            const key = `${PREDICTION_KEY_PREFIX}${predictionId}`;
            return await redisClient.exists(key) === 1;
        } catch (error) {
            console.error('[CacheService] Error checking prediction existence:', error);
            throw error;
        }
    },

    // Get all predictions
    getAllPredictions: async () => {
        try {
            await ensureConnection();
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
        } catch (error) {
            console.error('[CacheService] Error getting all predictions:', error);
            throw error;
        }
    },

    // Delete prediction
    deletePrediction: async (predictionId) => {
        try {
            await ensureConnection();
            const key = `${PREDICTION_KEY_PREFIX}${predictionId}`;
            await redisClient.del(key);
            await redisClient.srem(ALL_PREDICTIONS_KEY, predictionId);
        } catch (error) {
            console.error('[CacheService] Error deleting prediction:', error);
            throw error;
        }
    },

    // Get predictions by status
    getPredictionsByStatus: async (status) => {
        try {
            await ensureConnection();
            const predictions = await cacheService.getAllPredictions();
            return predictions.filter(pred => pred.status === status);
        } catch (error) {
            console.error('[CacheService] Error getting predictions by status:', error);
            throw error;
        }
    },

    // Check prediction status with detailed information
    checkPredictionStatus: async (predictionId) => {
        try {
            await ensureConnection();
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
        } catch (error) {
            console.error('[CacheService] Error checking prediction status:', error);
            throw error;
        }
    },

    // Purge all predictions from Redis
    purgeAllPredictions: async () => {
        try {
            await ensureConnection();

            // Get all prediction IDs
            const predictionIds = await redisClient.smembers(ALL_PREDICTIONS_KEY);

            if (predictionIds.length === 0) {
                return {
                    success: true,
                    message: 'No predictions found to purge',
                    purgedCount: 0
                };
            }

            // Delete all prediction keys
            const keys = predictionIds.map(id => `${PREDICTION_KEY_PREFIX}${id}`);
            await redisClient.del(...keys);

            // Clear the set of all predictions
            await redisClient.del(ALL_PREDICTIONS_KEY);

            return {
                success: true,
                message: `Successfully purged ${predictionIds.length} predictions`,
                purgedCount: predictionIds.length
            };
        } catch (error) {
            console.error('[CacheService] Error purging all predictions:', error);
            throw error;
        }
    },

    // Purge predictions by status
    purgePredictionsByStatus: async (status) => {
        try {
            await ensureConnection();

            // Get all predictions
            const predictions = await cacheService.getAllPredictions();

            // Filter predictions by status
            const predictionsToPurge = predictions.filter(pred => pred.status === status);

            if (predictionsToPurge.length === 0) {
                return {
                    success: true,
                    message: `No predictions found with status: ${status}`,
                    purgedCount: 0
                };
            }

            // Delete predictions
            const keys = predictionsToPurge.map(pred => `${PREDICTION_KEY_PREFIX}${pred.id}`);
            await redisClient.del(...keys);

            // Update the set of all predictions
            const remainingIds = predictions
                .filter(pred => pred.status !== status)
                .map(pred => pred.id);

            if (remainingIds.length > 0) {
                await redisClient.del(ALL_PREDICTIONS_KEY);
                await redisClient.sadd(ALL_PREDICTIONS_KEY, ...remainingIds);
            } else {
                await redisClient.del(ALL_PREDICTIONS_KEY);
            }

            return {
                success: true,
                message: `Successfully purged ${predictionsToPurge.length} predictions with status: ${status}`,
                purgedCount: predictionsToPurge.length
            };
        } catch (error) {
            console.error('[CacheService] Error purging predictions by status:', error);
            throw error;
        }
    }
};

module.exports = cacheService; 