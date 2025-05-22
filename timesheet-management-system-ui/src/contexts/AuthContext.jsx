import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const base_url = "https://timesheet-management-system-api.vercel.app";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        setLoading(true);
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          handleLogout();
        } else {
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = ` ${token}`;
          // Fetch user profile
          fetchUserProfile();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        handleLogout();
      }
      finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/auth/profile`);
      console.log(response.data)
      setUser(response.data.user);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      handleLogout();
    }
    finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      console.log(credentials)
      
      const response = await axios.post(`${base_url}/api/auth/login`, credentials);

     
      console.log(response.data)
      const { token } = response.data;
      
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `${token}`;
      
      // Fetch user profile
      await fetchUserProfile();
      
      toast.success('Login successful');
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.log(error)
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const handleRegister = async (userData) => {
    try {
      await axios.post(`${base_url}/api/auth/register`, userData);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  const handleLogout = () => {
    // Remove token from localStorage
    // localStorage.removeItem('token');
    
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset user state
    setUser(null);
    setLoading(false);
    
    // Redirect to login
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}