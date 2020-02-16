const express = require('express');

const server = express();

// passport
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const credentials = require('./credentials');

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
  clientID: credentials.client_id,
  clientSecret: credentials.client_secret,
  callbackURL: 'http://localhost:1200/profile',
},
((accessToken, refreshToken, profile) => {
  console.log(profile);
})));


// server set

server.set('view engine', 'ejs');

server.get('/', (req, res) => res.render('main', { title: 'Home', message: 'Hello! homepage for you' }));
server.get('/login', (req, res) => res.render('main', { title: 'login', message: 'please login guys!' }));
server.get('/profile', (req, res) => res.render('main', { title: 'profile', message: 'oh it is you!' }));

// auth
server.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

server.listen(1200, () => console.log('start at port localhost:1200'));
