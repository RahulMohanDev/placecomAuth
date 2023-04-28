import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRouter from './controller/authController.js'

dotenv.config()
const app = express()

// DB basic setup
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => console.log('Connected to MongoDB'))

// session middleware
// we are using session from express-session
// cookies will store some data
import session from 'express-session'
// i am importing mongodbSession from connect-mongodb-session
import mongodbSession from 'connect-mongodb-session'

const MongoDBStore = mongodbSession(session)

const store = new MongoDBStore({
  uri: process.env.DATABASE_URL,
  collection: 'sessions',
})

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
)

// middleware
app.use(express.json())
// today we will learn this !
app.use(express.urlencoded({ extended: true }))

// static files
app.use(express.static('public'))

// simple router for session
app.get('/session', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user })
  } else {
    res.json({ user: null })
  }
})

app.use('/api/v1/auth', authRouter)

// simple port code
const portNo = process.env.PORT_NO || 3000

app.listen(portNo, () => {
  console.log(`Example app listening on port ${portNo}!`)
})
