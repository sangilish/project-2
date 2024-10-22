const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');  // Import the app
const User = mongoose.model('User');  // Import the User model

// Clear the database before each test
beforeEach(async () => {
  await User.deleteMany({});
});

// Close the connection after all tests
after(async () => {
  mongoose.connection.close();
});

describe('User Authentication Tests', function () {

    // Test for successful login with correct credentials
    it('should login successfully with correct credentials', async function () {
      // Create a user manually before testing login
      const user = new User({ email: 'test@test.com', password: 'test123' });
      await user.save();  // Make sure the user exists in the database
  
      await request(app)
        .post('/auth')
        .set('Content-Type', 'application/x-www-form-urlencoded')  // Explicitly set content type
        .send({ email: 'test@test.com', password: 'test123' })  // Ensure correct body format
        .expect(200)
        .expect('Login successful! Session started.');
    });
  
    // Test for incorrect password
    it('should not login with incorrect password', async function () {
      // Create a user manually before testing incorrect password
      const user = new User({ email: 'test@test.com', password: 'test123' });
      await user.save();  // User exists in the database
  
      await request(app)
        .post('/auth')
        .set('Content-Type', 'application/x-www-form-urlencoded')  // Explicitly set content type
        .send({ email: 'test@test.com', password: 'wrongpassword' })  // Ensure correct body format
        .expect(200)
        .expect('Incorrect password.');
    });
  
    // Test for creating a new account if email does not exist
    it('should create a new account if email does not exist', async function () {
      await request(app)
        .post('/auth')
        .set('Content-Type', 'application/x-www-form-urlencoded')  // Explicitly set content type
        .send({ email: 'newuser@test.com', password: 'newpassword' })  // Ensure correct body format
        .expect(200)
        .expect('Account created successfully!');
    });
  
  });