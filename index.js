const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/', express.static(path.join(__dirname, 'public')));

// Handle Mongoose deprecation warning
mongoose.set('strictQuery', false);

// Schema
const urlSchema = new mongoose.Schema({
    original_url: String,
    short_url: Number
});

const Url = mongoose.model('Url', urlSchema);

// MongoDB connection function
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const client = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            bufferCommands: false
        });
        cachedDb = client;
        console.log('New database connection');
        return cachedDb;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/shorturl', async (req, res) => {
    try {
        await connectToDatabase();
        const { url } = req.body;
        
        // Simple URL validation
        const urlRegex = /^(http|https):\/\/[^ "]+$/;
        if (!urlRegex.test(url)) {
            return res.json({ error: 'invalid url' });
        }

        // Find existing URL or create new one
        let urlDoc = await Url.findOne({ original_url: url });
        
        if (!urlDoc) {
            const count = await Url.countDocuments({});
            urlDoc = new Url({
                original_url: url,
                short_url: count + 1
            });
            await urlDoc.save();
        }

        return res.json({
            original_url: urlDoc.original_url,
            short_url: urlDoc.short_url
        });
    } catch (error) {
        console.error('POST Error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/shorturl/:short_url', async (req, res) => {
    try {
        await connectToDatabase();
        const urlDoc = await Url.findOne({ 
            short_url: parseInt(req.params.short_url) 
        });

        if (!urlDoc) {
            return res.json({ error: 'No short URL found' });
        }

        return res.redirect(urlDoc.original_url);
    } catch (error) {
        console.error('GET Error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Only start server if not in Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app;