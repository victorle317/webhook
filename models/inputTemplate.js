const mongoose = require('mongoose');

mongoose.Schema.Types.String.checkRequired(v => v != null)
// Schema for the input dictionary/template that admins can update
const inputTemplateSchema = new mongoose.Schema({
    model: {
        type: String,
        required: true
    },
    //nếu là model shakker thì version là ""
    version: {
        type: String,
        required: true
    },
    //nếu là model shakker thì weightUrl là khác rỗng
    weightUrl: {
        type: String,
        required: true
    },
    go_fast: {
        type: Boolean,
        default: false
    },
    isSelfTrained: {
        type: Boolean,
        default: null
    },
    classification: {
        clothing_type: {
            type: [String],
            default: [],
        },
        background: {
            type: [String],
        },
        gender: {
            type: [String],
            default: [],
        },
        style: {
            type: [String],
            default: [],
        }
    },
    prompt: {
        type: String,
        required: true
    },
    aspect_ratio: {
        type: String,
        default: "1:1"
    },
    output_quality: {
        type: Number,
        default: 100
    },
    output_format: {
        type: String,
        default: "webp"
    },
    prompt_strength: {
        type: Number,
        default: 0.8
    },
    lora_scale: {
        type: Number,
        default: 1
    },
    num_inference_steps: {
        type: Number,
        default: 28
    },
    guidance_scale: {
        type: Number,
        default: 3
    },
}, { timestamps: true });



// Create indexes for common queries
inputTemplateSchema.index({ 'classification.gender': 1 });
inputTemplateSchema.index({ 'classification.clothing_type': 1 });
inputTemplateSchema.index({ 'classification.style': 1 });
// inputTemplateSchema.index({ model: 1 });


// Create models using the schemas
const InputTemplate = mongoose.model('InputTemplate', inputTemplateSchema);


module.exports = { InputTemplate };
