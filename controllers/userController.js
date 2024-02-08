require('dotenv').config();
const User = require('../models/user');
const Expense = require('../models/expense');
const path =require('path');
const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../util/database');
const AWS = require('aws-sdk');

function generateToken(id)
{
   return jwt.sign({userId :id}, process.env.ACCESS_TOKEN_SECRET);
}

//Add user details to user table
exports.postAddUser = async (req, res, next) => {
  console.log('Received form data:', req.body);
  const { name, email, password} = req.body;

  try {
    const user = await User.findOne({
      where: { email: email }
    });

    if (user) {
      return res.status(404).send(`
      <script>
        alert("User already exists, Please login!");
        window.location.href = '/';
      </script>
    `);
    }
  
    //Randomization of strings
    // more saltround value leads to less similarity of password but slows down the application
    const saltRounds=10;

    //encrypt the password before storing it
    const hashedPassword= await bcrypt.hash(password, saltRounds);

    // Create user
    const createdUser = await User.create({
      name,
      email,
      password: hashedPassword
    });
    
    console.log('Created user:', createdUser.name);
    return res.status(404).send(`
        <script>
          alert("User Created Successfully, Please login!");
          window.location.href = '/';
        </script>
      `);

  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
};

//Check the exisitng users
exports.postLoginUser = async (req, res, next) => {
  console.log('Received login form data:', req.body);
  const { email, password } = req.body;

  try {
    // Check if the user with the given email exists
    const user = await User.findOne({
      where: { email: email }
    });

    if (!user) {
      // User not found
      return res.status(404).send(`
        <script>
          alert("User does not exist, Please sign up!");
          window.location.href = '/';
        </script>
      `);
    }
    
    const isPassword = await bcrypt.compare(password, user.password);

    // Check if the provided password matches the stored password
    if (!isPassword) {
      // Password doesn't match
      return res.status(401).send(`
        <script>
          alert("Incorrect password, please try again!");
          window.location.href = '/';
        </script>
      `);
    }

    // Password is valid, user is authenticated
    console.log('Successfully logged in');
    res.status(200).json({success: true, message:`User Logged in succesfully`, accessToken: generateToken(user.id),isPremiumUser:user.ispremiumuser});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//Add Expense details of a user
exports.postAddExpense= async (req, res, next) => {
  console.log('Received form data:', req.body);
  const t  = await sequelize.transaction();
  const { amount, description, category} = req.body;
  
  try {    
      // Create expense
     await Expense.create({
      amount,
      description,
      category,
      userId: req.user.id,
    },{transaction:t});

    const totalExpense = Number(req.user.totalexpenses) + Number(amount);

    //update total expenses in the user table
    await User.update({ totalexpenses: totalExpense }, {
            where: { id: req.user.id },
            transaction:t        
        });

        await t.commit();

     const expenses= await Expense.findAll({
      where: { userId: req.user.id },
    });
    res.json({expenses})
    console.log('Expense Added:');
  }
    catch (err) {
      await t.rollback();
      res.status(500).send('Internal Server Error');
    }  
  } 


// get expense details of a user
exports.getExpenseDetails = async (req, res, next) => {
try{
  const page = parseInt(req.query.page)||1;
  const limit = parseInt(req.query.limit) || 5;

  const offset = (page-1) *limit;

  const expenses = await Expense.findAndCountAll({ 
    where: { userId: req.user.id  },
    limit:limit,
    offset:offset
  });
   
  const totalExpenses = expenses.count;
  console.log("Inside Get expense details... Totalexpense :",totalExpenses);
  const totalPages = Math.ceil(totalExpenses / limit);

   return res.status(200).json({
    expenses: expenses.rows || [],
    success: true,
    totalPages: totalPages
});
}
catch(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
}
    }

exports.updateExpense = async (req, res) => {
  const expenseId = req.params.id;
  const { amount, description, category } = req.body;

  try {
    const expense = await Expense.findByPk(expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Update expense attributes
    expense.amount = amount;
    expense.description = description;
    expense.category = category;

    await expense.save();

    res.json({ message: 'Expense updated successfully' });
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteExpense = async (req, res) => {
  const t  = await sequelize.transaction();

  const expenseId = req.params.id
  try {
    const expense = await Expense.findByPk(expenseId);
    const expenseAmount = expense.amount;
    await Expense.destroy({ where: { id: expenseId}, transaction:t });

    const updatedTotalExpense = Number(req.user.totalexpenses) - Number(expenseAmount);

    await User.update({ totalexpenses: updatedTotalExpense }, {
      where: { id: req.user.id },
      transaction:t
  });

     await t.commit();
    return res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    t.rollback();
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getDashboard = (req, res) => {
  res.sendFile(path.join(__dirname, '../views', '/expense.html'));
};

function uploadToS3(data, filename) {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY =process.env.IAM_USER_KEY;
  const IAM_USER_SECRET_KEY = process.env.IAM_USER_SECRET_KEY;

  const s3bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET_KEY,
  });

  const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: data,
      ACL:'public-read'
  };
 
  return new Promise((resolve,reject)=>{
    s3bucket.upload(params, (err, s3response) => {
      if (err) {
          console.log('Something went wrong while uploading to S3', err);
          reject(err);
      } else {
          console.log('Success', s3response);
           resolve(s3response.Location);
      }
  });
  })
}

exports.getDownloadExpense = async (req, res) => {
  try{
    const expenses = await req.user.getExpenses();
 const stringifiedExpenses = JSON.stringify(expenses);
    const userId= req.user.id;
    const filename = `Expense${userId}/${new Date()}.txt`
  const fileUrl= await uploadToS3(stringifiedExpenses, filename);
  res.status(200).json({fileUrl, success:true});
  }
  catch(err){
    console.log(err);
  res.status(500).json({fileUrl:'', success:false, err:err});
  }
  
};


