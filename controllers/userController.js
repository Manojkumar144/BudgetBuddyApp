const User = require('../models/user');

//Add user details to user table
exports.postAddUser = async (req, res, next) => {
  console.log('Received form data:', req.body);
  const { name, email, password} = req.body;

  try {
    const user = await User.findOne({
      where: { email: email }
    });

    if (user) {
      return res.status(400).json({ error: 'User already exists. Please login!' });
    }

    // Create user
    const createdUser = await User.create({
      name,
      email,
      password
    });
    
    console.log('Created user:', createdUser.name);
    res.redirect('/');

  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
};


//Check the existing user for the login form
exports.postLoginUser = async (req, res, next) => {
  console.log('Received login form data:', req.body);
  const {email, password} = req.body;

  try {
    const user = await User.findOne({
      where: { email: email , password: password  }
    });

    if (!user) {
      return res.status(400).json({ error: 'User does not exist. Please Sign up!' });
    }
    
    console.log('Successfully logged in');
    res.redirect('/');

  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
};


