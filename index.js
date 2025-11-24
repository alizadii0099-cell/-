const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8000;

// Routers
const qrRouter = require('./qr');
const codeRouter = require('./pair');

// Increase max event listeners (avoid warnings)
require('events').EventEmitter.defaultMaxListeners = 500;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use routers
app.use('/qr', qrRouter);
app.use('/code', codeRouter);

// Static HTML routes
app.get('/pair', (req, res) => {
  res.sendFile(path.join(__dirname, 'pair.html'));
});

app.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'qr.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

// Serve static CSS/JS
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

module.exports = app;
