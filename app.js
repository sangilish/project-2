const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/usersDB');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));  // For form submissions
app.use(bodyParser.json());  // For JSON payloads

// Session setup
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Define user schema and model
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Serve static files
app.use(express.static('public'));

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

// Handle login/signup logic
app.post('/auth', async (req, res) => {
    console.log('Request body:', req.body);  // Check request body for debugging
    const { email, password } = req.body;
  
    try {
      const foundUser = await User.findOne({ email: email });
  
      if (foundUser) {
        // If the user exists, check password for login
        if (foundUser.password === password) {
          req.session.user = foundUser;
          res.cookie('userEmail', email);
          console.log(`Login successful for ${email}`);
          res.send('Login successful! Session started.');
        } else {
          console.log(`Incorrect password for ${email}`);
          res.send('Incorrect password.');
        }
      } else {
        // If the user does not exist, create a new account
        const newUser = new User({ email: email, password: password });
        await newUser.save();
        console.log(`Account created for ${email}`);
        res.send('Account created successfully!');
      }
    } catch (err) {
      console.error('Error during login/signup:', err);
      res.status(500).send('Internal server error.');
    }
  });

  
// Protected route
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.send(`Welcome back, ${req.session.user.email}`);
  } else {
    res.redirect('/');
  }
});

// Logout logic
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out.');
    }
    res.clearCookie('userEmail');
    res.redirect('/');
  });
});

// Start server only if this file is executed directly
if (require.main === module) {
  app.listen(3000, () => {
    console.log('Server running on port 3000.');
  });
}

// Export the app for testing
module.exports = app;