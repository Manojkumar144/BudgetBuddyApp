const express = require('express');
const router = express.Router();

const purchaseController = require('../controllers/purchaseController');
const authenticateMiddleware= require('../middleware/auth');

router.get('/premium', authenticateMiddleware.authenticateToken, purchaseController.purchasepremium);
router.post('/updatetransactionstatus', authenticateMiddleware.authenticateToken, purchaseController.updatetransactionstatus);

module.exports=router;

