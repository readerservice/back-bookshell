const env = require("../config/env");

exports.getUserSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.user.id
        const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.revenueSecretApiKey}`
            }
        })
        const data = await response.json()
        const entitlements = data?.subscriber?.entitlements || {};
        const entitlement = entitlements["premium"];

        let premium = false;
        let expiresAt = null;
        let productId = null;

        if (entitlement) {
            expiresAt = entitlement.expires_date;
            productId = entitlement.product_identifier;
            premium = new Date(expiresAt) > new Date();
        }

        res.json({
            premium,
            expiresAt,
            productId
        });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'Failed to fetch subscription status' })
    }
};