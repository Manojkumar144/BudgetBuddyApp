const express = require('express');
const router = express.Router();

const premiumController = require('../controllers/premiumController');
const authenticateMiddleware= require('../middleware/auth');

router.get('/premium/leaderboard', authenticateMiddleware.authenticateToken, premiumController.getLeaderboardDetails);

module.exports=router;

