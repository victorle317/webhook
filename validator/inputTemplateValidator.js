const { body } = require('express-validator');

const aspectRatioEnum = [
    '1:1', '16:9', '21:9', '3:2', '2:3', '4:5', '5:4',
    '3:4', '4:3', '9:16', '9:21', 'custom'
];

const modelEnum = ['dev', 'schnell'];
const outputFormatEnum = ['webp', 'jpg', 'png'];
const megapixelsEnum = ['1', '0.25'];

const templateValidationRules = [
    // Required fields validation
    body('*.modelName').notEmpty().withMessage('Model name is required'),
    body('*.image').optional(),
    body('*.classification').isObject().withMessage('Classification must be an object'),
    body('*.classification.clothing_type').isArray().withMessage('Clothing type must be an array'),
    body('*.classification.background').isArray().withMessage('Background must be an array'),
    body('*.classification.gender').isArray().withMessage('Gender must be an array'),
    body('*.classification.style').isArray().withMessage('Style must be an array'),
    body('*.prompt').notEmpty().withMessage('Prompt is required'),
    body('*.aspect_ratio').isIn(aspectRatioEnum).withMessage('Invalid aspect ratio'),
    body('*.output_quality').isInt({ min: 0, max: 100 }).withMessage('Output quality must be between 0 and 100'),
    body('*.output_format').isIn(outputFormatEnum).withMessage('Invalid output format'),
    body('*.prompt_strength').isFloat({ min: 0, max: 1 }).withMessage('Prompt strength must be between 0 and 1'),
    body('*.lora_scale').isFloat({ min: -1, max: 3 }).withMessage('Lora scale must be between -1 and 3'),
    body('*.num_inference_steps').isInt({ min: 1, max: 50 }).withMessage('Number of inference steps must be between 1 and 50'),
    body('*.guidance_scale').isFloat({ min: 0, max: 10 }).withMessage('Guidance scale must be between 0 and 10'),

    // Optional fields with defaults
    body('*.mask').optional(),
    body('*.height').optional().isInt({ min: 256, max: 1440 }).withMessage('Height must be between 256 and 1440'),
    body('*.width').optional().isInt({ min: 256, max: 1440 }).withMessage('Width must be between 256 and 1440'),
    body('*.model').optional().isIn(modelEnum).withMessage('Invalid model type'),
    body('*.num_outputs').optional().isInt({ min: 1, max: 4 }).withMessage('Number of outputs must be between 1 and 4'),
    body('*.seed').optional().isInt().withMessage('Seed must be an integer'),
    body('*.disable_safety_checker').optional().isBoolean().withMessage('Disable safety checker must be a boolean'),
    body('*.go_fast').optional().isBoolean().withMessage('Go fast must be a boolean'),
    body('*.megapixels').optional().isIn(megapixelsEnum).withMessage('Invalid megapixels value'),
    body('*.extra_lora').optional(),
    body('*.extra_lora_scale').optional().isFloat({ min: -1, max: 3 }).withMessage('Extra lora scale must be between -1 and 3'),

    // Custom validation for aspect ratio
    body().custom((value, { req }) => {
        const templates = Array.isArray(value) ? value : [value];

        templates.forEach((template, index) => {
            if (template.aspect_ratio === 'custom') {
                if (!template.height || !template.width) {
                    throw new Error(`Template at index ${index}: Height and width are required when aspect_ratio is set to custom`);
                }
                if (template.height % 16 !== 0 || template.width % 16 !== 0) {
                    throw new Error(`Template at index ${index}: Height and width must be multiples of 16 when using custom aspect ratio`);
                }
            }
        });
        return true;
    })
];

const singleTemplateValidationRules = [
    // Required fields validation
    body('modelName').notEmpty().withMessage('Model name is required'),
    body('image').optional(),
    body('classification').isObject().withMessage('Classification must be an object'),
    body('classification.clothing_type').isArray().withMessage('Clothing type must be an array'),
    body('classification.background').isArray().withMessage('Background must be an array'),
    body('classification.gender').isArray().withMessage('Gender must be an array'),
    body('classification.style').isArray().withMessage('Style must be an array'),
    body('prompt').notEmpty().withMessage('Prompt is required'),
    body('aspect_ratio').isIn(aspectRatioEnum).withMessage('Invalid aspect ratio'),
    body('output_quality').isInt({ min: 0, max: 100 }).withMessage('Output quality must be between 0 and 100'),
    body('output_format').isIn(outputFormatEnum).withMessage('Invalid output format'),
    body('prompt_strength').isFloat({ min: 0, max: 1 }).withMessage('Prompt strength must be between 0 and 1'),
    body('lora_scale').isFloat({ min: -1, max: 3 }).withMessage('Lora scale must be between -1 and 3'),
    body('num_inference_steps').isInt({ min: 1, max: 50 }).withMessage('Number of inference steps must be between 1 and 50'),
    body('guidance_scale').isFloat({ min: 0, max: 10 }).withMessage('Guidance scale must be between 0 and 10'),

    // Optional fields with defaults
    body('mask').optional(),
    body('height').optional().isInt({ min: 256, max: 1440 }).withMessage('Height must be between 256 and 1440'),
    body('width').optional().isInt({ min: 256, max: 1440 }).withMessage('Width must be between 256 and 1440'),
    body('model').optional().isIn(modelEnum).withMessage('Invalid model type'),
    body('num_outputs').optional().isInt({ min: 1, max: 4 }).withMessage('Number of outputs must be between 1 and 4'),
    body('seed').optional().isInt().withMessage('Seed must be an integer'),
    body('disable_safety_checker').optional().isBoolean().withMessage('Disable safety checker must be a boolean'),
    body('go_fast').optional().isBoolean().withMessage('Go fast must be a boolean'),
    body('megapixels').optional().isIn(megapixelsEnum).withMessage('Invalid megapixels value'),
    body('extra_lora').optional(),
    body('extra_lora_scale').optional().isFloat({ min: -1, max: 3 }).withMessage('Extra lora scale must be between -1 and 3'),

    // Custom validation for aspect ratio
    body().custom((value) => {
        if (value.aspect_ratio === 'custom') {
            if (!value.height || !value.width) {
                throw new Error('Height and width are required when aspect_ratio is set to custom');
            }
            if (value.height % 16 !== 0 || value.width % 16 !== 0) {
                throw new Error('Height and width must be multiples of 16 when using custom aspect ratio');
            }
        }
        return true;
    })
];

const inputTemplateValidator = [
    // Check if body is an array or object
    body().custom((value) => {
        if (!Array.isArray(value) && typeof value !== 'object') {
            throw new Error('Request body must be either a template object or an array of templates');
        }
        return true;
    }),
    // Apply appropriate validation rules based on body type
    body().custom((value, { req }) => {
        if (Array.isArray(value)) {
            req.body = value;
            return templateValidationRules;
        } else {
            req.body = [value];
            return singleTemplateValidationRules;
        }
    })
];

module.exports = {
    inputTemplateValidator
};
