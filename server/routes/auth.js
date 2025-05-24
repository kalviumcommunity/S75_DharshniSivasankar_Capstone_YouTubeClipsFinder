const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const auth = require("../middleware/auth")

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Check if user already exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }

    user = await User.findOne({ username })
    if (user) {
      return res.status(400).json({ message: "Username already taken" })
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
    })

    await user.save()

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
      },
    }

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      })
    })
  } catch (error) {
    console.error("Error in register:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
      },
    }

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      })
    })
  } catch (error) {
    console.error("Error in login:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get current user
router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
