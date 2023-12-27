const User = require('../models/user');

//Add user details to user table
exports.postAddUser = async (req, res, next) => {
  console.log('Received form data:', req.body);
  const { name, email, password} = req.body;

  try {
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

