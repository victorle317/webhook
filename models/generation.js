const mongoose = require('mongoose');

mongoose.Schema.Types.String.checkRequired(v => v != null)



const generationSchema = new mongoose.Schema({
    predictionId: String,
    status: String,
    error: String,
    url: String,
    replicateUrl: String,
    prompt: {
        type: String,
        required: true
    },
    model:{
        type: String,
        required: true
    },
    weightUrl: {
        type: String,
        required: true
    },
    userInput: {
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
    chosenSettings: mongoose.Schema.Types.Mixed,
    replicateRawOutput: mongoose.Schema.Types.Mixed,
    logs: String
}, { timestamps: true });

// Add any needed indexes
generationSchema.index({ predictionId: 1 });
generationSchema.index({ status: 1 });
generationSchema.index({ url: 1 });
generationSchema.index({ createdAt: -1 });


const Generation = mongoose.model('Generation', generationSchema);

// Update the exports
module.exports = {
    Generation,
};
