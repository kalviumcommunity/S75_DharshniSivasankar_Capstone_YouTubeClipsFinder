"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuthContext } from "../../context/AuthContext"
import "./AuthForms.css"

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [formError, setFormError] = useState("")
  const { register, error } = useAuthContext()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters")
      return
    }

    const success = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    })

    if (success) {
      navigate("/")
    }
  }

  return (
    <div className="auth-form-container">
      <h2>Create an Account</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        {(formError || error) && <div className="auth-error">{formError || error}</div>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
          />
        </div>

        <button type="submit" className="auth-button">
          Register
        </button>
      </form>

      <p className="auth-redirect">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}

export default RegisterForm
