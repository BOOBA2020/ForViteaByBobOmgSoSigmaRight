const express = require('express');
const cors = require('cors');
const gamepassesRouter = require('./gamepasses');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ROUTES
app.use('/gamepasses', gamepassesRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({
        message: 'API is working!',
        endpoints: {
            gamepasses: 'GET /gamepasses/:gameId?auth=YOUR_KEY&limit=100',
            test: 'GET /test'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 API Server running on port ${PORT}`);
    console.log(`📁 Endpoint: http://localhost:${PORT}/gamepasses/1818?auth=test&limit=5`);
});
