const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Schema
const urlSchema = new mongoose.Schema({
    original_url: String,
    short_url: Number
});

const Url = mongoose.model('Url', urlSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/shorturl', async (req, res) => {
    const { url } = req.body;
    
    // Simple URL validation
    const urlRegex = /^(http|https):\/\/[^ "]+$/;
    if (!urlRegex.test(url)) {
        return res.json({ error: 'invalid url' });
    }

    try {
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
    } catch (err) {
        console.error(err);
        return res.json({ error: 'Server error' });
    }
});

app.get('/api/shorturl/:short_url', async (req, res) => {
    try {
        const urlDoc = await Url.findOne({ 
            short_url: parseInt(req.params.short_url) 
        });

        if (!urlDoc) {
            return res.json({ error: 'No short URL found' });
        }

        return res.redirect(urlDoc.original_url);
    } catch (err) {
        console.error(err);
        return res.json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;