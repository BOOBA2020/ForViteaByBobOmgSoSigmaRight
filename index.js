const express = require('express');
const fetch = require('node-fetch');

const app = express();

// 👇 YOUR AUTH KEY - CHANGE THIS! 👇
const AUTH_KEY = "bobok123sigma";

// 👇 GAMEPASSES ENDPOINT 👇
app.get('/gamepasses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { auth, limit = 100 } = req.query;
        
        // CHECK AUTH KEY
        if (!auth) {
            return res.json({ success: false, error: 'Missing auth key' });
        }
        
        if (auth !== AUTH_KEY) {
            return res.json({ success: false, error: 'Invalid auth key' });
        }
        
        // GET GAMEPASSES FROM ROBLOX
        const url = `https://games.roblox.com/v1/games/${id}/game-passes?limit=${limit}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Roblox API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // GET PRICES FOR EACH GAMEPASS
        const gamepassesWithPrice = [];
        
        for (const gamepass of data.data || []) {
            try {
                const priceUrl = `https://economy.roproxy.com/v2/assets/${gamepass.id}/details`;
                const priceRes = await fetch(priceUrl);
                
                if (priceRes.ok) {
                    const priceData = await priceRes.json();
                    gamepassesWithPrice.push({
                        id: gamepass.id,
                        name: gamepass.name,
                        priceInRobux: priceData.PriceInRobux || 0,
                        isForSale: priceData.IsForSale || false,
                        productId: gamepass.productId
                    });
                }
            } catch (err) {
                gamepassesWithPrice.push({
                    id: gamepass.id,
                    name: gamepass.name,
                    priceInRobux: 0,
                    isForSale: false,
                    productId: gamepass.productId
                });
            }
        }
        
        // RETURN DATA
        res.json({
            success: true,
            gameId: parseInt(id),
            requestedAt: new Date().toISOString(),
            count: gamepassesWithPrice.length,
            gamepasses: gamepassesWithPrice
        });
        
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// 👇 TEST ROUTE 👇
app.get('/', (req, res) => {
    res.send(`
        <h1>✅ ROBLOX GAMEPASS API</h1>
        <p><strong>Endpoint:</strong> GET /gamepasses/:gameId?auth=KEY&limit=100</p>
        <p><strong>Example:</strong> <a href="/gamepasses/1818?auth=${AUTH_KEY}&limit=5">Test Now</a></p>
        <p><strong>Current Auth Key:</strong> ${AUTH_KEY}</p>
    `);
});

// 👇 HEALTH CHECK 👇
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;
