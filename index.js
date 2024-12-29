const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config();

const app = express();
const Url = require('./models/Url');

// Connect to MongoDB with optimized settings
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 5000,
    connectTimeoutMS: 3000,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// URL validation function
function isValidUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (err) {
        return false;
    }
}

// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST endpoint to create short URL
app.post('/api/shorturl', async (req, res) => {
    const { url } = req.body;
    
    // Check URL validity
    if (!isValidUrl(url)) {
        return res.json({ error: 'invalid url' });
    }

    try {
        // Check if URL exists in database
        let urlDoc = await Url.findOne({ original_url: url }).maxTimeMS(2000);
        
        if (!urlDoc) {
            // Create new short URL
            const count = await Url.countDocuments().maxTimeMS(2000);
            urlDoc = await Url.create({
                original_url: url,
                short_url: count + 1
            });
        }

        return res.json({
            original_url: urlDoc.original_url,
            short_url: urlDoc.short_url
        });
    } catch (error) {
        console.error('POST Error:', error);
        return res.json({ error: 'invalid url' });
    }
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', async (req, res) => {
    try {
        const shortUrl = parseInt(req.params.short_url);
        if (isNaN(shortUrl)) {
            return res.json({ error: 'invalid url' });
        }

        const urlDoc = await Url.findOne({ short_url: shortUrl }).maxTimeMS(2000);
        
        if (!urlDoc) {
            return res.json({ error: 'No short URL found' });
        }

        return res.redirect(urlDoc.original_url);
    } catch (error) {
        console.error('GET Error:', error);
        return res.json({ error: 'invalid url' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;