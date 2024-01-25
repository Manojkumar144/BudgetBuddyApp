const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.error('Error during authentication:', err);

            // Check the error name to handle specific cases
            if (err.name === 'TokenExpiredError') {
                // Token has expired
                return res.status(401).json({ error: 'Token has expired' });
            } else if (err.name === 'JsonWebTokenError') {
                // Token is malformed or invalid
                return res.status(403).json({ error: 'Invalid token' });
            } else {
                // Other unknown errors
                return res.status(500).json({ error: 'Internal server error' });
            }
        }

        // Authentication successful, set user on the request object
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
