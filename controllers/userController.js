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

    // Check if the provided password matches the stored password
    if (user.password !== password) {

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
    res.send(`
      <script>
        alert("Successfully logged in!");
        window.location.href = '/';
      </script>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



