const mongoose = require('mongoose');

mongoose.Schema.Types.String.checkRequired(v => v != null)
// Schema for the input dictionary/template that admins can update
const inputTemplateSchema = new mongoose.Schema({
    modelName: {
        type: String,
        required: true
    },
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
    image: {
        type: String,
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
    extra_lora: {
        type: String,
        default: ""
    },
    extra_lora_scale: {
        type: Number,
        default: 1.3
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

//create a static method to reduce the number of fields in the for unauthenticated users response

inputTemplateSchema.statics.reduceFields = function(template) {
    return {
        template_id: template._id,
        modelName: template.modelName,
        go_fast: template.go_fast,
        image: template.image,
        classification: template.classification,
        prompt: template.prompt,
        aspect_ratio: template.aspect_ratio,
        output_quality: template.output_quality,
        output_format: template.output_format,
        prompt_strength: template.prompt_strength,
        lora_scale: template.lora_scale,
        num_inference_steps: template.num_inference_steps,
        guidance_scale: template.guidance_scale,
    };
};
// Create models using the schemas
const InputTemplate = mongoose.model('InputTemplate', inputTemplateSchema);


module.exports = { InputTemplate };
