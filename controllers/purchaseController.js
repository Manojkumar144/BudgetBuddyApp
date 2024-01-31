const Razorpay = require('razorpay');
const Order = require('../models/order');

exports.purchasepremium = async(req,res) =>{
    try{
      console.log(" inside purchase premium........");
        var razorPay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret:process.env.RAZORPAY_KEY_SECRET
        })

        const amount =2500;
       
        razorPay.orders.create({ amount, currency: "INR"}, async(err, order)=>{
            if(err)
            {
              console.error('Error creating Razorpay order:', err);
              throw new Error(JSON.stringify(err));
            }
            else{
            req.user.createOrder({ orderid: order.id,  status: 'PENDING'}).then(()=>{
                return res.status(201).json({ order, key_id: razorPay.key_id});  
            })
            .catch(err =>{
                throw new Error(err);
            })
          }
        })
    }
    catch(err){
        console.log(err);
        res.status(403).json({ message: 'something went wrong', error: err});
    }
}

exports.updatetransactionstatus = (req, res) => {
    try {
      const { payment_id, order_id } = req.body;
      Order.findOne({ where: { orderid: order_id } }).then((order) => {
        order.update({ paymentid: payment_id, status: 'SUCCESSFUL' }).then(() => {
          req.user.update({ ispremiumuser: true }).then(() => {
            return res.status(202).json({ success: true, message: 'Transaction Successful' });
          }).catch((err) => {
            throw new Error(err);
          });
        });
      });
    } catch (err) {
      console.log(err);
      res.status(403).json({ error: err, message: 'Something went wrong' });
    }
  };

 