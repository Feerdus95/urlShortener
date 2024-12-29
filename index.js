const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

const app = express();
const Url = require('./models/Url');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(__dirname));
// URL validation function
function isValidUrl(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      dns.lookup(urlObj.hostname, (err) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } catch (err) {
      resolve(false);
    }
  });
}

// POST endpoint to create short URL
app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;
  
  // Check URL validity
  const isValid = await isValidUrl(url);
  if (!isValid) {
    return res.json({ error: 'invalid url' });
  }

  try {
    // Check if URL exists in database
    let urlDoc = await Url.findOne({ original_url: url });
    
    if (!urlDoc) {
      // Create new short URL
      const count = await Url.countDocuments();
      urlDoc = await Url.create({
        original_url: url,
        short_url: count + 1
      });
    }

    res.json({
      original_url: urlDoc.original_url,
      short_url: urlDoc.short_url
    });
  } catch (error) {
    res.json({ error: 'Server error' });
  }
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const urlDoc = await Url.findOne({ 
      short_url: parseInt(req.params.short_url) 
    });
    
    if (!urlDoc) {
      return res.json({ error: 'No short URL found' });
    }

    res.redirect(urlDoc.original_url);
  } catch (error) {
    res.json({ error: 'Server error' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('URL Shortener Microservice');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;