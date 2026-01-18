// COPY THIS EXACT CODE
const express = require('express');
const fetch = require('node-fetch');

const app = express();

// YOUR EXACT ENDPOINT: /gamepasses/123456
app.get('/gamepasses/:gameId', async (req, res) => {
    const { gameId } = req.params;
    const { auth, limit = 100 } = req.query;
    
    // 1. CHECK AUTH KEY
    if (!auth) {
        return res.json({ error: 'Missing auth key' });
    }
    
    // 2. GET GAMEPASSES FROM ROBLOX
    const robloxUrl = `https://games.roblox.com/v1/games/${gameId}/game-passes?limit=${limit}`;
    
    try {
        const robloxResponse = await fetch(robloxUrl);
        const robloxData = await robloxResponse.json();
        
        // 3. GET PRICES FOR EACH
        const passesWithPrices = [];
        
        for (const pass of robloxData.data || []) {
            try {
                const priceUrl = `https://economy.roblox.com/v2/assets/${pass.id}/details`;
                const priceResponse = await fetch(priceUrl);
                const priceData = await priceResponse.json();
                
                passesWithPrices.push({
                    id: pass.id,
                    name: pass.name,
                    price: priceData.PriceInRobux || 0,
                    onSale: priceData.IsForSale || false,
                    description: pass.description || ''
                });
            } catch (err) {
                passesWithPrices.push({
                    id: pass.id,
                    name: pass.name,
                    price: 0,
                    onSale: false
                });
            }
        }
        
        // 4. RETURN DATA (EXACTLY LIKE YOUR OLD API)
        res.json({
            success: true,
            gameId: parseInt(gameId),
            requestedAt: new Date().toISOString(),
            count: passesWithPrices.length,
            gamepasses: passesWithPrices
        });
        
    } catch (error) {
        res.json({
            success: false,
            error: 'Failed to fetch',
            message: error.message
        });
    }
});

// TEST PAGE
app.get('/', (req, res) => {
    res.send(`
        <h1>✅ API IS WORKING</h1>
        <p>Use: /gamepasses/1818?auth=YOUR_KEY&limit=100</p>
        <a href="/gamepasses/1818?auth=test&limit=5">Test Now</a>
    `);
});

// VERCEL NEEDS THIS
module.exports = app;
