const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const chatRoutes = require('./routes/chat');

// Mount Routes
app.use('/api/chat', chatRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AstroPsycho Local AI Backend is running!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 AstroPsycho AI Backend is running on port ${PORT}`);
    console.log(`📡 Connecting to local Ollama on port 11434...`);
    console.log(`======================================================\n`);
});
