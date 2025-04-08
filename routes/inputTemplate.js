const express = require('express');
const router = express.Router();
const { InputTemplate } = require('../models/inputTemplate');

// CREATE - Add a new input template
router.post('/', async (req, res) => {
    //mapping specific fields in req.body to inputTemplateSchema
    let weightUrl = '';
    let model = '';
    let modelName = '';

    if (req.body.isSelfTrained == false) {
        weightUrl = `https://victorle317.sgp1.cdn.digitaloceanspaces.com/models/${req.body.model}.safetensors`;
        model = 'black-forest-labs/flux-dev-lora';
        modelName = req.body.model;
    } else {
        model = req.body.model;
        modelName = req.body.modelName;
    }

    const inputTemplate = new InputTemplate({
        // Required base fields
        modelName: modelName,
        model: model,
        version: req.body.version || "",
        weightUrl: weightUrl, // Handle both possible sources
        isSelfTrained: req.body.isSelfTrained,

        // Classification mapping
        classification: {
            clothing_type: req.body.classification?.clothing_type || [],
            background: req.body.classification?.background || [],
            gender: req.body.classification?.gender || [],
            style: req.body.classification?.style || []
        },

        // Generation parameters
        prompt: req.body.prompt,
        aspect_ratio: req.body.aspect_ratio,
        output_quality: req.body.output_quality,
        output_format: req.body.output_format,
        prompt_strength: req.body.prompt_strength,
        lora_scale: req.body.lora_scale,
        num_inference_steps: req.body.num_inference_steps,
        guidance_scale: req.body.guidance || req.body.guidance_scale // Handle both possible names
    });

    try {
        const savedTemplate = await inputTemplate.save();
        res.status(201).json(savedTemplate);
    } catch (error) {
        res.status(400).json({
            message: 'Error creating template',
            error: error.message
        });
    }
});

// READ - Get all templates with optional filters
router.get('/', async (req, res) => {
    try {
        const filters = {};

        // Add filters if they exist in query
        if (req.query.model) filters.model = req.query.model;
        if (req.query.version) filters.version = req.query.version;
        if (req.query.isSelfTrained !== undefined) {
            filters.isSelfTrained = req.query.isSelfTrained === 'true';
        }

        // Handle array filters
        if (req.query.gender) {
            filters['classification.gender'] = { $in: Array.isArray(req.query.gender) ? req.query.gender : [req.query.gender] };
        }
        if (req.query.clothing_type) {
            filters['classification.clothing_type'] = { $in: Array.isArray(req.query.clothing_type) ? req.query.clothing_type : [req.query.clothing_type] };
        }
        if (req.query.style) {
            filters['classification.style'] = { $in: Array.isArray(req.query.style) ? req.query.style : [req.query.style] };
        }
        console.log(filters);
        const templates = await InputTemplate.find(filters);
        res.json(templates);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching templates',
            error: error.message
        });
    }
});

// BULK CREATE - Add multiple input templates
router.post('/bulk', async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({
            message: 'Request body must be an array of templates'
        });
    }

    try {
        const templatesData = req.body.map(templateData => {
            let weightUrl = '';
            let model = '';

            if (templateData.isSelfTrained === false) {
                weightUrl = `https://victorle317.sgp1.cdn.digitaloceanspaces.com/models/${templateData.model}.safetensors`;
                model = 'black-forest-labs/flux-dev-lora';
            } else {
                model = templateData.model;
            }

            return {
                // Required base fields
                model: model,
                version: templateData.version || "",
                weightUrl: weightUrl,
                isSelfTrained: templateData.isSelfTrained,

                // Classification mapping
                classification: {
                    clothing_type: templateData.classification?.clothing_type || [],
                    background: templateData.classification?.background || [],
                    gender: templateData.classification?.gender || [],
                    style: templateData.classification?.style || []
                },

                // Generation parameters
                prompt: templateData.prompt,
                aspect_ratio: templateData.aspect_ratio,
                output_quality: templateData.output_quality,
                output_format: templateData.output_format,
                prompt_strength: templateData.prompt_strength,
                lora_scale: templateData.lora_scale,
                num_inference_steps: templateData.num_inference_steps,
                guidance_scale: templateData.guidance || templateData.guidance_scale
            };
        });

        const savedTemplates = await InputTemplate.insertMany(templatesData, { 
            ordered: false // Continues processing remaining documents even if one fails
        });

        res.status(201).json({
            message: `Successfully created ${savedTemplates.length} templates`,
            templates: savedTemplates
        });
    } catch (error) {
        // If some documents were inserted before an error occurred
        const insertedCount = error.insertedDocs?.length || 0;
        
        res.status(400).json({
            message: 'Error creating templates',
            error: error.message,
            successfulInserts: insertedCount,
            failedInserts: req.body.length - insertedCount
        });
    }
});

// READ - Get single template by ID
router.get('/:id', async (req, res) => {
    try {
        const template = await InputTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json(template);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching template',
            error: error.message
        });
    }
});

// UPDATE - Update a template
router.put('/:id', async (req, res) => {
    try {
        const template = await InputTemplate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        
        res.json(template);
    } catch (error) {
        res.status(400).json({
            message: 'Error updating template',
            error: error.message
        });
    }
});

// DELETE - Delete a template
router.delete('/:id', async (req, res) => {
    try {
        const template = await InputTemplate.findByIdAndDelete(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting template',
            error: error.message
        });
    }
});

// SEARCH - Search templates by classification
router.post('/search', async (req, res) => {
    try {
        const { gender, clothing_type, style, background } = req.body;
        const searchQuery = {
            $and: []
        };

        if (gender?.length) {
            searchQuery.$and.push({ 'classification.gender': { $in: gender } });
        }
        if (clothing_type?.length) {
            searchQuery.$and.push({ 'classification.clothing_type': { $in: clothing_type } });
        }
        if (style?.length) {
            searchQuery.$and.push({ 'classification.style': { $in: style } });
        }
        if (background?.length) {
            searchQuery.$and.push({ 'classification.background': { $in: background } });
        }

        const templates = await InputTemplate.find(
            searchQuery.$and.length ? searchQuery : {}
        );
        res.json(templates);
    } catch (error) {
        res.status(500).json({
            message: 'Error searching templates',
            error: error.message
        });
    }
});

module.exports = router;