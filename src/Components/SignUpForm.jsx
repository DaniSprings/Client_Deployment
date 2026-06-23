import { useState } from "react";
import authApi from "../services/authApi";
import "./SignUpForm.css";

function SignUpForm({ onSuccess, onFailure }) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    dateOfBirth: "",
    occupation: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.surname.trim()) newErrors.surname = "Surname is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required";
    if (!formData.occupation.trim()) newErrors.occupation = "Occupation is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    
    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.signUp(formData);
      setSuccessMessage("✓ Account created successfully!");
      
      // Reset form
      setFormData({
        name: "",
        surname: "",
        dateOfBirth: "",
        occupation: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
      setErrors({});

      // Call onSuccess callback to close modal and update parent state
      if (onSuccess) {
        onSuccess({
          userId: response.userId || response.id,
          username: response.username || response.email || formData.email,
          email: response.email || formData.email
        });
      }
    } catch (error) {
      const errorMsg = error.message || "Failed to create account. Please try again.";
      setErrors({ submit: errorMsg });
      if (onFailure) {
        onFailure(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h1>Create Account</h1>
      <p className="signup-subtitle">Please fill in fields below to create an account and allow us to save your information securely.</p>
      
      {successMessage && <div className="success-message">{successMessage}</div>}
      {errors.submit && <div className="error-message">{errors.submit}</div>}

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          flexDirection: 'column',
          gap: '16px'
        }}>
          <span className="spinner"></span>
          <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600 }}>Creating Account...</p>
        </div>
      )}

      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="John"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="surname">Surname</label>
            <input
              type="text"
              id="surname"
              name="surname"
              placeholder="Doe"
              value={formData.surname}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.surname && <span className="error-text">{errors.surname}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="occupation">Occupation</label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              placeholder="Software Engineer"
              value={formData.occupation}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.occupation && <span className="error-text">{errors.occupation}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Username (Email)</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Re-enter Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="create-account-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </div>
  );
}

export default SignUpForm;
