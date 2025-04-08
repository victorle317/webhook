const cacheService = require('../../service/cacheService');

const purgeAllCacheHandler = async (req, res) => {
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
}

const getAllCacheHandler = async (req, res) => {
    try {
        const predictions = await cacheService.getAllPredictions();
        res.json(predictions);
    } catch (error) {
        console.error('Error fetching predictions:', error);
        res.status(500).json({ detail: "Internal server error" });
    }
}

const getCacheByIdHandler = async (req, res) => {
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
}


module.exports = {
    purgeAllCacheHandler,
    getAllCacheHandler,
    getCacheByIdHandler
}
