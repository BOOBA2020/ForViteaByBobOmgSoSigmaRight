const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// THIS IS THE EXACT ENDPOINT YOU'RE USING: /gamepasses/:gameId
router.get('/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const { auth, limit = 100 } = req.query;

        // AUTH CHECK (like the "bobdontleak..." key)
        if (!auth) {
            return res.status(401).json({ error: 'Missing auth key' });
        }
        
        // You can validate the auth key here
        // const validKeys = ['bobdontleaktsortxgbemad321', 'your-key-here'];
        // if (!validKeys.includes(auth)) { return res.status(403).json({ error: 'Invalid auth' }); }

        console.log(`Fetching gamepasses for game ${gameId}, limit: ${limit}`);

        // MAKE THE ACTUAL REQUEST TO ROBLOX
        const robloxResponse = await fetch(
            `https://games.roblox.com/v1/games/${gameId}/game-passes?limit=${Math.min(limit, 100)}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            }
        );

        if (!robloxResponse.ok) {
            throw new Error(`Roblox API failed: ${robloxResponse.status}`);
        }

        const gamepassData = await robloxResponse.json();
        
        // ENHANCE THE DATA (add prices, more info)
        const enhancedGamepasses = await Promise.all(
            (gamepassData.data || []).map(async (gamepass) => {
                try {
                    // Get detailed price info for EACH gamepass
                    const detailsResponse = await fetch(
                        `https://economy.roblox.com/v2/assets/${gamepass.id}/details`
                    );
                    
                    if (detailsResponse.ok) {
                        const details = await detailsResponse.json();
                        return {
                            ...gamepass,
                            priceInRobux: details.PriceInRobux || 0,
                            isForSale: details.IsForSale || false,
                            premiumPricing: details.PremiumPricing || null
                        };
                    }
                } catch (err) {
                    console.error(`Failed to fetch details for gamepass ${gamepass.id}:`, err);
                }
                
                return {
                    ...gamepass,
                    priceInRobux: 0,
                    isForSale: false
                };
            })
        );

        // RETURN THE FINAL DATA (exactly like your API)
        res.json({
            success: true,
            gameId: parseInt(gameId),
            requestedAt: new Date().toISOString(),
            count: enhancedGamepasses.length,
            gamepasses: enhancedGamepasses
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch gamepasses',
            message: error.message
        });
    }
});

module.exports = router;
