const User = require('../models/user');
const Expense = require('../models/expense');
const path =require('path');

const bcrypt =require('bcrypt');

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
    res.sendFile(path.join(__dirname, '../views','/expense.html'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//Add Expense details of a user
exports.postAddExpense= async (req, res, next) => {
  console.log('Received form data:', req.body);
  const { amount, description, category} = req.body;

  try {
    // Create expense
     await Expense.create({
      amount,
      description,
      category,
    });

    Expense.findAll()
    .then((expense)=>res.json(expense))
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
    console.log('Expense Added:');
    
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
};

// get expense details of a user
exports.getExpenseDetails = (req, res, next) => {
  Expense.findAll()
    .then((expense)=>res.json(expense))
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
};

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
  const expenseId = req.params.id;

  try {
    const expense = await Expense.findByPk(expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Delete the expense
    await expense.destroy();

    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};