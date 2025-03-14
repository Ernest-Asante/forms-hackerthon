import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
} from "@mui/material";
import { auth } from "../firebase-config"; // Import auth
import { signInWithEmailAndPassword } from "firebase/auth"; // Import signInWithEmailAndPassword

const organization = {
  name: "GESA KNUST",
  logo: "https://picsum.photos/300/200", // Random logo
};

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(""); // State to handle errors
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle email/password login
  const handleLogin = async () => {
    setError(""); // Clear previous errors
    try {
      // Sign in with email and password
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate("/dashboard"); // Navigate to Dashboard after successful login
    } catch (err) {
      setError(err.message); // Display error message
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={5}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            backgroundColor: "#fff",
          }}
        >
          {/* Organization Logo */}
          <Box component="img" src={organization.logo} alt="Logo" sx={{ mb: 2 }} />

          {/* Organization Name */}
          <Typography variant="h5" fontWeight="bold" color="#1DA1F2" sx={{ mb: 3 }}>
            {organization.name}
          </Typography>

          {/* Display error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Email Input */}
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            sx={{ mb: 2 }}
            value={formData.email}
            onChange={handleChange}
          />

          {/* Password Input */}
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            sx={{ mb: 3 }}
            value={formData.password}
            onChange={handleChange}
          />

          {/* Login Button */}
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#1DA1F2",
              color: "#fff",
              py: 1.5,
              fontSize: "1rem",
              "&:hover": { backgroundColor: "#0d8ae8" },
            }}
            onClick={handleLogin}
          >
            Login
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;