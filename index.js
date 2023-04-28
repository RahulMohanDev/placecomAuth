// connect mongodb
import mongoose from 'mongoose'
import bycrypt from 'bcrypt'
import session from 'express-session'
import MongoDBStore from 'express-mongodb-session'
import express, { urlencoded } from 'express'
import User from './model/user.model'

console.log(process.env.DATABASE_URL)

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => console.log('Connected to MongoDB'))

const store = new MongoDBStore({
  uri: process.env.DATABASE_URL,
  collection: 'sessions',
})

const sessionMiddleware = session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  store,
})

const app = express()

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(express.static('public'))

app.use(sessionMiddleware)

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  if (!user) {
    return res.status(401).send('Invalid username or password')
  }
  user.checkPassword(password, function (err, result) {
    if (err || !result) {
      return res.status(401).send('Invalid username or password')
    }
    req.session.user = user
    res.send('Logged in')
  })
})

app.post('/logout', (req, res) => {
  req.session.destroy()
  res.send('Logged out')
})

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).send('Username already exists');
  }
  const newUser = new User({ username, password });
  newUser.save(function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Error creating user');
    }
    req.session.user = newUser;
    res.send('User created');
  });
});

// protected route with middleware
function requireLogin(req, res, next) {
  if (req.session.user) {
    next()
  } else {
    res.status(401).send('Unauthorized')
  }
}

app.get('/protected', requireLogin, (req, res) => {
  res.send('Protected resource')
})
