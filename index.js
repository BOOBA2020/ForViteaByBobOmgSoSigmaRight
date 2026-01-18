// SIMPLE API - NO FOLDERS NEEDED
const express = require('express');
const fetch = require('node-fetch');

const app = express();

// YOUR GAMEPASSES ENDPOINT
app.get('/gamepasses/:id', async (req, res) => {
    const { id } = req.params;
    const { auth, limit = 100 } = req.query;
    
    if (!auth) return res.json({ error: 'Need auth key' });
    
    // Get gamepasses from Roblox
    const url = `https://games.roblox.com/v1/games/${id}/game-passes?limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    
    res.json({
        success: true,
        gameId: parseInt(id),
        gamepasses: data.data || [],
        count: (data.data || []).length
    });
});

// Test route
app.get('/', (req, res) => {
    res.send(`
        <h1>✅ API WORKING</h1>
        <p>Use: /gamepasses/123456?auth=KEY&limit=100</p>
        <a href="/gamepasses/1818?auth=test&limit=5">Test Now</a>
    `);
});

// Vercel needs this
module.exports = app;
