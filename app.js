const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/usersDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Define user schema and model
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Body parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session setup
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Serve static files from 'public' for CSS
app.use(express.static(path.join(__dirname, 'public')));

// Serve the 'views' folder as static to access HTML files
app.use(express.static(path.join(__dirname, 'views')));

// Serve the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Serve the login page (login.html)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Handle login/signup logic
app.post('/auth', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const foundUser = await User.findOne({ email });

    if (foundUser) {
      // Check if the password matches for the found user
      if (foundUser.password === password) {
        req.session.user = foundUser;
        res.cookie('userEmail', email);
        console.log(`Login successful for ${email}`);
        res.send('Login successful! Session started.');
      } else {
        // Email found, but password is wrong
        console.log(`Incorrect password for ${email}`);
        res.send('Wrong password.');
      }
    } else {
      // Email not found, create a new account
      const newUser = new User({ email, password });
      await newUser.save();
      console.log(`Account created for ${email}`);
      res.send('Account created successfully!');
    }
  } catch (err) {
    console.error('Error during login/signup:', err);
    res.status(500).send('Internal server error.');
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

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

module.exports = app;