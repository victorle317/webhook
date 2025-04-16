const express = require('express');
const router = express.Router();
const Model = require('../models/model');

// GET - Get all available models
router.get('/', async (req, res) => {
    try {
        const models = await Model.find();
        if(req.isAdmin){
            res.json(models);
        }else{
            res.json(
                {   
                    modelNameList: models.map(model => model.modelName),
                    clothingTypeList: [...new Set(models.flatMap(model => model.classification.clothing_type))],
                    backgroundList: [...new Set(models.flatMap(model => model.classification.background))],
                    genderList: [...new Set(models.flatMap(model => model.classification.gender))],
                    styleList: [...new Set(models.flatMap(model => model.classification.style))],
                    models: models.map(Model.reduceFields)
                }
            );
        }
    } catch (error) {
      console.error('Error in getModels:', error);
      res.status(500).json({
        status: 'Error',
        error: 'Error fetching models'
      });
    }
});

// POST - Add a new model or multiple models
router.post('/', async (req, res) => {
    try {
        // Check if the request body is an array
        if (Array.isArray(req.body)) {
            // Bulk insert
            const models = await Model.insertMany(req.body, { ordered: false });
            res.status(201).json({
                message: `Successfully created ${models.length} models`,
                models: models
            });
        } else {
            // Single model insert
            const model = new Model(req.body);
            const savedModel = await model.save();
            res.status(201).json(savedModel);
        }
    } catch (error) {
        // Handle bulk insert errors
        if (error.insertedDocs) {
            const insertedCount = error.insertedDocs.length;
            return res.status(400).json({
                message: 'Error creating some models',
                error: error.message,
                successfulInserts: insertedCount,
                failedInserts: Array.isArray(req.body) ? req.body.length - insertedCount : 0
            });
        }

        res.status(400).json({
            message: 'Error creating model(s)',
            error: error.message
        });
    }
});

// PUT - Update a model
router.put('/:id', async (req, res) => {
    try {
        const model = await Model.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }
        res.json(model);
    } catch (error) {
        res.status(400).json({
            message: 'Error updating model',
            error: error.message
        });
    }
});

// DELETE - Delete a model
router.delete('/:id', async (req, res) => {
    try {
        const model = await Model.findByIdAndDelete(req.params.id);
        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }
        res.json({ message: 'Model deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting model',
            error: error.message
        });
    }
});

module.exports = router; 