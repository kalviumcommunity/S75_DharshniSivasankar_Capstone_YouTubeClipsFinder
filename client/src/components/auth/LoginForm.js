"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuthContext } from "../../context/AuthContext"
import "./AuthForms.css"

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [formError, setFormError] = useState("")
  const { login, error } = useAuthContext()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    if (!formData.email || !formData.password) {
      setFormError("Please fill in all fields")
      return
    }

    const success = await login(formData)
    if (success) {
      navigate("/")
    }
  }

  return (
    <div className="auth-form-container">
      <h2>Login to Your Account</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        {(formError || error) && <div className="auth-error">{formError || error}</div>}

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
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="auth-button">
          Login
        </button>
      </form>

      <p className="auth-redirect">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}

export default LoginForm
