const express = require('express');
const fetch = require('node-fetch');

const app = express();
const AUTH_KEY = "bobok123sigma";

// ADD CORS HEADERS (like roproxy does)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

app.get('/gamepasses/:id', async (req, res) => {
    const { id } = req.params;
    const { auth, limit = 100 } = req.query;
    
    if (!auth || auth !== AUTH_KEY) {
        return res.json({ error: 'Invalid key', success: false });
    }
    
    try {
        // Fetch from Roblox
        const response = await fetch(
            `https://games.roblox.com/v1/games/${id}/game-passes?limit=${limit}`
        );
        
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        
        const data = await response.json();
        
        // Return exactly what Roblox returns
        res.json({
            success: true,
            gameId: parseInt(id),
            data: data.data || [],
            count: (data.data || []).length
        });
        
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.json({ 
        status: 'running',
        endpoint: '/gamepasses/:id?auth=KEY&limit=100',
        authKey: AUTH_KEY
    });
});

module.exports = app;
