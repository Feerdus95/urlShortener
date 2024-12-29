const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    original_url: {
        type: String,
        required: true,
        index: true
    },
    short_url: {
        type: Number,
        required: true,
        index: true
    }
});

// Add indexes
urlSchema.index({ original_url: 1 });
urlSchema.index({ short_url: 1 });

module.exports = mongoose.model('Url', urlSchema);