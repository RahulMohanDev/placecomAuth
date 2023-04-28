import express from 'express'
import User from '../model/user.model.js'

const router = express.Router()

router.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = User.findOne({ username })
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' })
  }
  user.validatePassword(password, (err, isValid) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid username or password' })
    }
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid username or password' })
    }
    req.session.user = user
    res.redirect('/home')
  })
})

router.post('/register', (req, res) => {
  const { username, password } = req.body
  const user = new User({ username, password })
  user.save((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Error registering new user please try again.' })
    }
    req.session.user = user
    res.redirect('/home')
  })
})

router.post('/logout', (req, res) => {
  if (req.session.user) {
    req.session.destroy()
    // res.clearCookie('connect.sid', { path: '/' })
    return res.status(200).json({ message: 'User logged out.' })
  }
  res.status(500).json({ message: 'No user to log out!' })
})

export default router
