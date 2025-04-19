const { InputTemplate } = require('../../models/inputTemplate');
const Model = require('../../models/model');
const { validationResult } = require('express-validator');

const addTemplateHandler = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
        status: 'Error',
        error: errors.array()
        });
    }
    try {
        // Check if the request body is an array
        if (Array.isArray(req.body)) {
            // Process array of templates
            const templatesData = [];
            const invalidModels = [];

            // Check each template's modelName
            for (const templateData of req.body) {
                const modelExists = await Model.findOne({ modelName: templateData.modelName });

                let extraLoraExists = null;
                if(templateData.extra_lora){
                    extraLoraExists = await Model.findOne({ modelName: templateData.extra_lora });
                }

                if (!modelExists) {
                    invalidModels.push(templateData.modelName);
                    continue;
                }

                let weightUrl = '';
                let model = '';
                let modelName = modelExists.modelName || '';

                if (modelExists.isSelfTrained === false) {
                    weightUrl = `https://victorle317.sgp1.cdn.digitaloceanspaces.com/models/${modelExists.modelName}.safetensors`;
                    model = 'black-forest-labs/flux-dev-lora';
                } else {
                    model = modelExists.modelName;
                }

                let temp ={
                    // Required base fields
                    modelName: modelName,
                    model: model,
                    version: modelExists.version || "",
                    weightUrl: weightUrl,
                    isSelfTrained: modelExists.isSelfTrained,
                
                    // go_fast: templateData.go_fast || false,
                    image: templateData.image || "",
                
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
                    go_fast: templateData.go_fast || false,
                    output_quality: templateData.output_quality,
                    output_format: templateData.output_format,
                                    prompt_strength: templateData.prompt_strength,
                                    lora_scale: templateData.lora_scale,
                                    num_inference_steps: templateData.num_inference_steps,
                                    guidance_scale: templateData.guidance || templateData.guidance_scale
                                }

                if(extraLoraExists){
                    temp.extra_lora = extraLoraExists.modelName;
                    temp.extra_lora_scale = templateData.extra_lora_scale;
                }

                templatesData.push(temp);
            }

            if (templatesData.length === 0) {
                return res.status(400).json({
                    message: 'No valid templates to create',
                    invalidModels: invalidModels
                });
            }

            const savedTemplates = await InputTemplate.insertMany(templatesData, {
                ordered: false // Continues processing remaining documents even if one fails
            });

            if (req.isAdmin) {
                res.status(201).json({
                    message: `Successfully created ${savedTemplates.length} templates`,
                    templates: savedTemplates,
                    invalidModels: invalidModels.length > 0 ? invalidModels : undefined
                });
            } else {
                res.status(201).json({
                    message: `Successfully created ${savedTemplates.length} templates`,
                    templates: savedTemplates.map(InputTemplate.reduceFields),
                    invalidModels: invalidModels.length > 0 ? invalidModels : undefined
                });
            }

        } else {
            // Process single template
            // Check if modelName exists
            const modelExists = await Model.findOne({ modelName: req.body.modelName });
            if (!modelExists) {
                return res.status(400).json({
                    message: 'Model not found',
                    error: `Model with name '${req.body.modelName}' does not exist`
                });
            }

            let weightUrl = '';
            let model = '';
            let modelName = modelExists.modelName || '';

            if (modelExists.isSelfTrained === false) {
                weightUrl = `https://victorle317.sgp1.cdn.digitaloceanspaces.com/models/${modelExists.modelName}.safetensors`;
                model = 'black-forest-labs/flux-dev-lora';
                modelName = modelExists.modelName;
            } else {
                model = modelExists.modelName;
            }

            const inputTemplate = new InputTemplate({
                // Required base fields
                modelName: modelName,
                model: model,
                version: modelExists.version || "",
                weightUrl: weightUrl,
                isSelfTrained: modelExists.isSelfTrained,

                image: req.body.image || "",

                // Classification mapping
                classification: {
                    clothing_type: req.body.classification?.clothing_type || [],
                    background: req.body.classification?.background || [],
                    gender: req.body.classification?.gender || [],
                    style: req.body.classification?.style || []
                },

                // Generation parameters
                prompt: req.body.prompt,
                go_fast: req.body.go_fast || false,
                aspect_ratio: req.body.aspect_ratio,
                output_quality: req.body.output_quality,
                output_format: req.body.output_format,
                prompt_strength: req.body.prompt_strength,
                lora_scale: req.body.lora_scale,
                num_inference_steps: req.body.num_inference_steps,
                guidance_scale: req.body.guidance || req.body.guidance_scale
            });

            const savedTemplate = await inputTemplate.save();
            if (req.isAdmin) {
                res.status(201).json(savedTemplate);
            } else {
                res.status(201).json({
                    message: 'Template created successfully',
                    template: InputTemplate.reduceFields(savedTemplate)
                });
            }
        }
    } catch (error) {
        // Handle bulk insert errors
        if (error.insertedDocs) {
            const insertedCount = error.insertedDocs.length;
            return res.status(400).json({
                message: 'Error creating some templates',
                error: error.message,
                successfulInserts: insertedCount,
                failedInserts: Array.isArray(req.body) ? req.body.length - insertedCount : 0
            });
        }

        console.error('Error in addTemplateHandler:', error);
        res.status(400).json({
            status: 'Error',
            error: 'Error creating template(s)'
        });
    }
}

const getTemplateHandler = async (req, res) => {
    try {
        const filters = {};

        // Add filters if they exist in query
        if (req.query.modelName) filters.modelName = req.query.modelName;
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

        if (req.isAdmin) {
            res.json(templates);
        } else {
            res.json(templates.map(InputTemplate.reduceFields));
        }

    } catch (error) {
        console.error('Error in getTemplateHandler:', error);
        res.status(500).json({
            status: 'Error',
            error: 'Error fetching templates'
        });
    }
}

const getTemplateByIdHandler = async (req, res) => {
    try {
        const template = await InputTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        if (req.isAdmin) {
            res.json(template);
        } else {
            res.json(InputTemplate.reduceFields(template));
        }

    } catch (error) {
        console.error('Error in getTemplateByIdHandler:', error);
        res.status(500).json({
            status: 'Error',
            error: 'Error fetching template'
        });
    }
}

const updateTemplateByIdHandler = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
        status: 'Error',
        error: errors.array()
        });
    }
    try {
        const template = await InputTemplate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        if (req.isAdmin) {
            res.json(template);
        } else {
            res.json(InputTemplate.reduceFields(template));
        }

    } catch (error) {
        console.error('Error in updateTemplateByIdHandler:', error);
        res.status(500).json({
            status: 'Error',
            error: 'Error updating template'
        });
    }
}

const deleteTemplateByIdHandler = async (req, res) => {
    try {
        const template = await InputTemplate.findByIdAndDelete(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {

        console.error('Error in deleteTemplateByIdHandler:', error);
        res.status(500).json({
            status: 'Error',
            error: 'Error deleting template'
        });
    }
}

const getTemplateStatisticsHandler = async (req, res) => {
    try {
        // Run all aggregations in parallel
        const [totalTemplates, classificationStats, modelStatsArray] = await Promise.all([
            // 1. Get total number of templates
            InputTemplate.countDocuments(),

            // 2. Get classification stats in a single pipeline
            InputTemplate.aggregate([
                {
                    $facet: {
                        clothingTypes: [
                            { $unwind: "$classification.clothing_type" },
                            { $group: { _id: "$classification.clothing_type", count: { $sum: 1 } } }
                        ],
                        backgrounds: [
                            { $unwind: "$classification.background" },
                            { $group: { _id: "$classification.background", count: { $sum: 1 } } }
                        ],
                        genders: [
                            { $unwind: "$classification.gender" },
                            { $group: { _id: "$classification.gender", count: { $sum: 1 } } }
                        ],
                        styles: [
                            { $unwind: "$classification.style" },
                            { $group: { _id: "$classification.style", count: { $sum: 1 } } }
                        ]
                    }
                }
            ]),

            // 3. Get model stats
            InputTemplate.aggregate([
                {
                    $group: {
                        _id: "$modelName",
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);
        console.log(classificationStats);
        // Transform classification stats
        const stats = classificationStats[0];
        const classificationStatsResult = {
            clothingTypes: {},
            backgrounds: {},
            genders: {},
            styles: {}
        };

        // Process each classification type
        Object.keys(stats).forEach(type => {
            stats[type].forEach(item => {
                if (item._id) {
                    classificationStatsResult[type][item._id] = item.count;
                }
            });
        });

        // Transform model stats
        const modelStats = {};
        modelStatsArray.forEach(stat => {
            modelStats[stat._id] = stat.count;
        });

        res.json({
            totalTemplates,
            classificationStats: classificationStatsResult,
            modelStats
        });

    } catch (error) {
        console.error('Error in getTemplateStatisticsHandler:', error);
        res.status(500).json({
            status: 'Error',
            error: 'Error fetching template statistics'
        });
    }
}

module.exports = {
    addTemplateHandler,
    getTemplateHandler,
    getTemplateByIdHandler,
    updateTemplateByIdHandler,
    deleteTemplateByIdHandler,
    getTemplateStatisticsHandler
}
