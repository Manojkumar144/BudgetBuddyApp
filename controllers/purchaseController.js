const Razorpay = require('razorpay');
const Order = require('../models/order');
const User = require('../models/user');

// const purchasepremium = async(req,res) =>{
//     try{
//       console.log(" inside purchase premium........");
//         var razorPay = new Razorpay({
//             key_id: process.env.RAZORPAY_KEY_ID,
//             key_secret:process.env.RAZORPAY_KEY_SECRET
//         })

//         const amount =2500;
       
//         razorPay.orders.create({ amount, currency: "INR"}, async(err, order)=>{
//             if(err)
//             {
//               console.error('Error creating Razorpay order:', err);
//               throw new Error(JSON.stringify(err));
//             }
//             else{
//             // console.log('orders', order);
//             console.log('user details',req.user);
//             console.log('After Razorpay order creation...');
//             console.log('order details',order);
//             req.user.createOrder({ orderid: order.id,  status: 'PENDING'}).then(()=>{
//                 return res.status(201).json({ order, key_id: razorPay.key_id});  
//                 // response.status(200).json({ key_id: key_id, orderid: id, user: user });
//                 //  return res.status(200).json({ key_id: razorPay.key_id, orderid: id, user: req.user });  

//             })
//             .catch(err =>{
//                 throw new Error(err);
//             })
//           }
//         })
//     }
//     catch(err){
//         console.log(err);
//         res.status(403).json({ message: 'something went wrong', error: err});
//     }
// }

exports.purchasepremium = async (req,res)=>{
  //console.log('id,skey...',process.env.RAZORPAY_KEY_ID,process.env.RAZORPAY_KEY_SECRET)
 try{
  let rzp = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET,
  })
  const amount = 2500
  rzp.orders.create({amount,currency:"INR"},(err,order)=>{
    if(err){
    throw new Error(JSON.stringify(err))
    }
    //console.log('order...',order)

    console.log('after creating order');

    //sequelize magic function for store info in database
    try{
    req.user.createOrder({orderid:order.id, status:'PENDING'}).then(() =>{  
        console.log('inside create order...');
        return res.status(201).json({order,key_id:rzp.key_id})
    }).catch(err =>{
       console.log('outside createOrder....catch');
        throw new Error(err)
    })
  }
  catch(err){
    console.log("First catch....",err);
  }
  })
 }catch(err){
  res.status(403).json({message:'something went wrong',error:err})
 }

}

exports.updatetransactionstatus = (req, res) => {
    try {
      const { payment_id, orderid } = req.body;
      Order.findOne({ where: { orderid: orderid } }).then((order) => {
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

 