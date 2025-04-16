const mongoose = require('mongoose');

mongoose.Schema.Types.String.checkRequired(v => v != null)

const modelSchema = new mongoose.Schema({
    modelName: {
        type: String,
        unique: true,
        required: true
    },
    version: {
        type: String,
        required: true
    },
    previewUrl: {
        type: [String],
        required: true
    },
    weightUrl: {
        type: String,
        required: true
    },
    isSelfTrained: {
        type: Boolean,
        required: true
    },
    // Additional fields from inputTemplate.js
    model: {
        type: String
    },
    classification: {
        clothing_type: [String],
        background: [String],
        gender: [String],
        style: [String]
    }
}, {
    timestamps: true
});

//create a static method to reduce the number of fields in the for unauthenticated users response
modelSchema.statics.reduceFields = function(model) {
    return {
        model_id: model._id,
        modelName: model.modelName,
        previewUrl: model.previewUrl,
        classification: model.classification,
    };
};

const Model = mongoose.model('Model', modelSchema);

module.exports = Model;


