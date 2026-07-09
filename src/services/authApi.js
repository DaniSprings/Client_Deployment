import axios from "axios";

const normalizeApiBase = (value, fallback) => {
  const raw = (value || fallback || "").trim();

  if (!raw) {
    return fallback;
  }

  const withProtocol = /^https?:\/\//i.test(raw)
    ? raw
    : `https://${raw.replace(/^\/+/, "")}`;

  return withProtocol.replace(/\/$/, "");
};

const API_BASE_URL = `${normalizeApiBase(
  import.meta.env.VITE_API_URL,
  "https://clientapi-production-afc7.up.railway.app",
)}/api/auth`;

// Create dedicated axios instance for auth
const authAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Response interceptor for auth errors
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Handle 401 Unauthorized
    if (response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }

    // Log errors for debugging
    console.error(
      `[Auth Error] ${response?.status} - ${error.message}`,
      response?.data,
    );

    return Promise.reject({
      status: response?.status,
      message: response?.data?.message || error.message,
      errors: response?.data?.errors || {},
      data: response?.data,
    });
  },
);

// Validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const authApi = {
  /**
   * Sign up with complete user information
   * @param {Object} signUpData - User signup data
   * @returns {Promise<Object>} Authentication response with token
   */
  signUp: async (signUpData) => {
    try {
      // Validate inputs
      if (!validateEmail(signUpData.email)) {
        throw { message: "Invalid email format" };
      }
      if (!validatePassword(signUpData.password)) {
        throw { message: "Password must be at least 6 characters" };
      }
      if (signUpData.password !== signUpData.confirmPassword) {
        throw { message: "Passwords do not match" };
      }

      const response = await authAxios.post("/signup", {
        name: signUpData.name?.trim(),
        surname: signUpData.surname?.trim(),
        dateOfBirth: signUpData.dateOfBirth,
        occupation: signUpData.occupation?.trim(),
        email: signUpData.email?.toLowerCase().trim(),
        password: signUpData.password,
        confirmPassword: signUpData.confirmPassword,
      });

      // Store auth token
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userId", response.data.userId);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error || { message: "Sign up failed" };
    }
  },

  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication response with token
   */
  login: async (email, password) => {
    try {
      if (!validateEmail(email)) {
        throw { message: "Invalid email format" };
      }

      const response = await authAxios.post("/login", {
        email: email?.toLowerCase().trim(),
        password,
      });

      // Store auth token
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userId", response.data.userId);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error || { message: "Login failed" };
    }
  },

  /**
   * Register user (alternative endpoint)
   * @param {Object} registerData - Registration data
   * @returns {Promise<Object>} Registration response
   */
  register: async (registerData) => {
    try {
      if (!validateEmail(registerData.email)) {
        throw { message: "Invalid email format" };
      }

      const response = await authAxios.post("/register", {
        email: registerData.email?.toLowerCase().trim(),
        username: registerData.username?.trim(),
        fullName: registerData.fullName?.trim(),
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error || { message: "Registration failed" };
    }
  },

  /**
   * Track user search
   * @param {string} userId - User ID
   * @param {string} searchTerm - Search term
   * @param {Object} filter - Search filters
   * @returns {Promise<Object>} Tracking response
   */
  trackSearch: async (userId, searchTerm, filter) => {
    try {
      const response = await authAxios.post("/search", {
        userId,
        searchTerm: searchTerm?.trim(),
        filter,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error || { message: "Search tracking failed" }
      );
    }
  },

  /**
   * Get user search history
   * @param {string} userId - User ID
   * @param {Object} options - Query options (limit, offset, etc)
   * @returns {Promise<Array>} User's search history
   */
  getUserSearches: async (userId, options = {}) => {
    try {
      let url = `/user/${userId}/searches`;
      if (options.limit || options.offset) {
        const params = new URLSearchParams();
        if (options.limit) params.append("limit", options.limit);
        if (options.offset) params.append("offset", options.offset);
        url += `?${params.toString()}`;
      }

      const response = await authAxios.get(url);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error || { message: "Failed to fetch searches" }
      );
    }
  },

  /**
   * Clear user search history
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Clear response
   */
  clearSearchHistory: async (userId) => {
    try {
      const response = await authAxios.delete(`/user/${userId}/searches`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error || { message: "Failed to clear search history" }
      );
    }
  },

  /**
   * Verify email
   * @param {string} email - Email to verify
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Verification response
   */
  verifyEmail: async (email, token) => {
    try {
      const response = await authAxios.post("/verify-email", {
        email,
        token,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error || { message: "Email verification failed" }
      );
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request response
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await authAxios.post("/forgot-password", {
        email: email?.toLowerCase().trim(),
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error || { message: "Password reset request failed" }
      );
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Reset response
   */
  resetPassword: async (token, newPassword) => {
    try {
      if (!validatePassword(newPassword)) {
        throw { message: "Password must be at least 6 characters" };
      }

      const response = await authAxios.post("/reset-password", {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error || { message: "Password reset failed" }
      );
    }
  },

  /**
   * Social login
   * @param {string} provider - OAuth provider (google, facebook, etc)
   * @param {string} providerId - Provider user ID
   * @param {string} email - User email
   * @param {string} fullName - User full name
   * @returns {Promise<Object>} Authentication response
   */
  socialLogin: async (provider, providerId, email, fullName) => {
    try {
      const response = await authAxios.post("/social-login", {
        provider: provider?.toLowerCase(),
        providerId,
        email: email?.toLowerCase().trim(),
        fullName: fullName?.trim(),
      });

      // Store auth token
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userId", response.data.userId);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error || { message: "Social login failed" };
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>} Logout response
   */
  logout: async () => {
    try {
      const response = await authAxios.post("/logout", {});
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      return response.data;
    } catch (error) {
      // Clear auth even if request fails
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      throw error.response?.data || error || { message: "Logout failed" };
    }
  },

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} New token response
   */
  refreshToken: async () => {
    try {
      const response = await authAxios.post("/refresh-token", {});
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }
      return response.data;
    } catch (error) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      throw (
        error.response?.data || error || { message: "Token refresh failed" }
      );
    }
  },

  /**
   * Get current user info
   * @returns {Promise<Object>} Current user data
   */
  getCurrentUser: async () => {
    try {
      const response = await authAxios.get("/me");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error || { message: "Failed to fetch user" }
      );
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated user data
   */
  updateProfile: async (profileData) => {
    try {
      const response = await authAxios.put("/me", profileData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error || { message: "Profile update failed" }
      );
    }
  },

  /**
   * Change password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Change response
   */
  changePassword: async (oldPassword, newPassword) => {
    try {
      if (!validatePassword(newPassword)) {
        throw { message: "Password must be at least 6 characters" };
      }

      const response = await authAxios.post("/change-password", {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error || { message: "Password change failed" }
      );
    }
  },

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  checkEmailExists: async (email) => {
    try {
      const response = await authAxios.get(
        `/check-email?email=${encodeURIComponent(email)}`,
      );
      return response.data.exists;
    } catch (error) {
      throw error.response?.data || error || { message: "Email check failed" };
    }
  },

  /**
   * Validate token
   * @param {string} token - Token to validate
   * @returns {Promise<boolean>} True if token is valid
   */
  validateToken: async (token) => {
    try {
      const response = await authAxios.post("/validate-token", { token });
      return response.data.valid;
    } catch {
      return false;
    }
  },
};

export default authApi;
