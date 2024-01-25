const express = require('express');
const router = express.Router();

const purchaseController = require('../controllers/purchaseController');
const authenticateMiddleware= require('../middleware/auth');


router.get('/premium', authenticateMiddleware, purchaseController.purchasepremium);
router.post('/updatetransactionstatus', authenticateMiddleware, purchaseController.updatetransactionstatus);

module.exports=router;

