import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Button,
  Paper,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase-config";
import "../App.css";

const FormPage = () => {
  const { id } = useParams(); // Get the form ID from the URL
  const [formData, setFormData] = useState(null); // State to store the form data
  const [userResponses, setUserResponses] = useState({}); // State to store user responses
  const [userInfo, setUserInfo] = useState({ name: "", email: "" }); // State to store user information
  const [imagePreviews, setImagePreviews] = useState({}); // State to store image previews
  const [fileNames, setFileNames] = useState({}); // State to store file names
  const [loading, setLoading] = useState(false); // State to handle loading

  // Fetch the form data from Firestore
  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      try {
        const formDoc = await getDoc(doc(db, "forms", id)); // Fetch the form document
        if (formDoc.exists()) {
          setFormData(formDoc.data()); // Set the form data
        } else {
          console.error("Form not found");
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [id]); // Re-fetch when the ID changes

  // Handle input changes for form elements
  const handleInputChange = (elementId, value) => {
    setUserResponses((prev) => ({
      ...prev,
      [elementId]: value,
    }));
  };

  // Handle file uploads for image and file elements
  const handleFileUpload = async (elementId, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        // For image elements, create a preview
        const imageUrl = URL.createObjectURL(file);
        setImagePreviews((prev) => ({
          ...prev,
          [elementId]: imageUrl,
        }));
      }

      // Upload the file to Firebase Storage
      const fileRef = ref(storage, `user-files/${id}/${elementId}_${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      // Store the file URL in userResponses
      setUserResponses((prev) => ({
        ...prev,
        [elementId]: fileUrl,
      }));

      // Store the file name for display
      setFileNames((prev) => ({
        ...prev,
        [elementId]: file.name,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Map userResponses to use custom labels as keys
      const labeledResponses = {};
      formData.elements.forEach((el) => {
        const responseValue = userResponses[el.id];
        if (responseValue !== undefined && responseValue !== "") {
          labeledResponses[el.customLabel] = responseValue;
        }
      });

      // Prepare the user's response data
      const userResponseData = {
        formId: id, // Reference the original form ID
        userInfo, // Include user information
        responses: labeledResponses, // Include user responses with custom labels
        timestamp: new Date(), // Add a timestamp
      };

      // Add the user's response to the "user-forms" collection
      await addDoc(collection(db, "user-forms"), userResponseData);

      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    }
  };

  if (!formData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    ); // Display a loading spinner
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: "white",
          maxWidth: 800,
          mx: "auto", // Center the form
        }}
      >
        {/* Form Title and Description */}
        <Typography variant="h4" fontWeight="bold" mb={3} color="#1DA1F2">
          {formData.title}
        </Typography>
        <Typography variant="body1" mb={3} color="text.secondary">
          {formData.description}
        </Typography>
        {formData.logo && (
          <Avatar
            src={formData.logo}
            alt="Form Logo"
            sx={{ width: 100, height: 100, mb: 3, mx: "auto" }}
          />
        )}

        {/* User Information Fields */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Your Name"
            variant="outlined"
            value={userInfo.name}
            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Your Email"
            variant="outlined"
            value={userInfo.email}
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
          />
        </Box>

        {/* Form Elements */}
        {formData.elements.map((el) => (
          <Box key={el.id} sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={1}>
              {el.customLabel}
            </Typography>
            {el.type === "text" ||
            el.type === "email" ||
            el.type === "number" ? (
              <TextField
                fullWidth
                variant="outlined"
                placeholder={el.customLabel}
                value={userResponses[el.id] || ""}
                onChange={(e) => handleInputChange(el.id, e.target.value)}
              />
            ) : el.type === "select" ? (
              <FormControl fullWidth>
                <Select
                  value={userResponses[el.id] || ""}
                  onChange={(e) => handleInputChange(el.id, e.target.value)}
                >
                  {el.options.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : el.type === "radio" ? (
              <RadioGroup
                value={userResponses[el.id] || ""}
                onChange={(e) => handleInputChange(el.id, e.target.value)}
              >
                {el.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            ) : el.type === "checkbox" ? (
              el.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={userResponses[el.id]?.includes(option) || false}
                      onChange={(e) => {
                        const updatedResponses = userResponses[el.id] || [];
                        if (e.target.checked) {
                          updatedResponses.push(option);
                        } else {
                          updatedResponses.splice(updatedResponses.indexOf(option), 1);
                        }
                        handleInputChange(el.id, updatedResponses);
                      }}
                    />
                  }
                  label={option}
                />
              ))
            ) : el.type === "image" ? (
              <Box>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(el.id, e)}
                  style={{ display: "none" }}
                  id={`image-upload-${el.id}`}
                />
                <label htmlFor={`image-upload-${el.id}`}>
                  <Button variant="contained" component="span">
                    Upload Image
                  </Button>
                </label>
                {imagePreviews[el.id] && (
                  <img
                    src={imagePreviews[el.id]}
                    alt="Preview"
                    style={{ width: 100, height: 100, marginTop: 10, borderRadius: 8 }}
                  />
                )}
              </Box>
            ) : el.type === "file" ? (
              <Box>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(el.id, e)}
                  style={{ display: "none" }}
                  id={`file-upload-${el.id}`}
                />
                <label htmlFor={`file-upload-${el.id}`}>
                  <Button variant="contained" component="span">
                    Upload File
                  </Button>
                </label>
                {fileNames[el.id] && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected File: {fileNames[el.id]}
                  </Typography>
                )}
              </Box>
            ) : null}
          </Box>
        ))}

        {/* Submit Button */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            mt: 2,
            width: "100%",
            backgroundColor: "#1DA1F2",
            "&:hover": { backgroundColor: "#0d8ae8" },
          }}
        >
          Submit Form
        </Button>
      </Paper>
    </Box>
  );
};

export default FormPage;