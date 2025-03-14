import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { storage } from "../firebase-config";
import { db } from "../firebase-config";
import { collection, addDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FormContext } from "./formContext"; // Import the context
import "../App.css";

const organization = {
  name: "GESA KNUST",
  logo: "https://picsum.photos/300/200", // Random logo
};

const elements = [
  { id: 1, type: "text", label: "Text Input" },
  { id: 2, type: "email", label: "Email Input" },
  { id: 3, type: "number", label: "Number Input" },
  { id: 4, type: "select", label: "Select Dropdown" },
  { id: 5, type: "radio", label: "Radio Group" },
  { id: 6, type: "checkbox", label: "Checkbox" },
  { id: 7, type: "file", label: "File Upload" },
  { id: 8, type: "image", label: "Image Upload" },
];

const CreateForm = () => {
  const [selectedElements, setSelectedElements] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [entityInputs, setEntityInputs] = useState({});
  const [imagePreviews, setImagePreviews] = useState({}); // Store image previews
  const [fileNames, setFileNames] = useState({}); // Store file names
  const [formTitle, setFormTitle] = useState(""); // Form title
  const [formDescription, setFormDescription] = useState(""); // Form description
  const { formData } = useContext(FormContext); // Access the context

   const navigate = useNavigate(); // Hook for navigation
  

  const handleSelectElement = (element) => {
    setSelectedElements([
      ...selectedElements,
      { ...element, id: Date.now(), customLabel: "", options: [] },
    ]);
  };

  const handleLabelChange = (id, value) => {
    setSelectedElements(
      selectedElements.map((el) =>
        el.id === id ? { ...el, customLabel: value } : el
      )
    );
  };

  const handleDeleteElement = (id) => {
    setSelectedElements(selectedElements.filter((el) => el.id !== id));
  };

  const handleAddEntity = (id, value) => {
    setSelectedElements(
      selectedElements.map((el) =>
        el.id === id ? { ...el, options: [...el.options, value] } : el
      )
    );
    setEntityInputs({ ...entityInputs, [id]: "" });
  };

  const handleImageUpload = async (id, event) => {
    const file = event.target.files[0];
    if (file) {
      const storageRef = ref(storage, `images/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setImagePreviews({ ...imagePreviews, [id]: downloadURL });
    }
  };

  const handleFileUpload = async (id, event) => {
    const file = event.target.files[0];
    if (file) {
      const storageRef = ref(storage, `files/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setFileNames({ ...fileNames, [id]: { name: file.name, url: downloadURL } });
    }
  };

  const handleSubmitForm = async () => {
    try {
      // Step 1: Upload the logo to Firebase Storage (if provided)
      let logoUrl = "";
      if (formData.logo) {
        const logoRef = ref(storage, `logos/${Date.now()}_${formData.logo.name}`);
        await uploadBytes(logoRef, formData.logo);
        logoUrl = await getDownloadURL(logoRef);
      }

      // Step 2: Prepare the form data
      const formDataForFirestore = {
        title: formData.title,
        description: formData.description,
        logo: logoUrl, // Use the uploaded logo URL
        elements: selectedElements, // Send all selected elements as-is
      };

      // Step 3: Submit the form data to Firestore
      const docRef = await addDoc(collection(db, "forms"), formDataForFirestore);
      console.log("Form submitted successfully with ID:", docRef.id);

      await updateDoc(docRef, { id: docRef.id });

      alert("Form submitted successfully!");
       navigate("/dashboard"); // Navigate to Dashboard after successful login
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* AppBar */}
      <AppBar elevation={0} position="static" sx={{ backgroundColor: "white", boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#1DA1F2", fontWeight: "bold" }}>
            {organization.name}
          </Typography>
        </Toolbar>
      </AppBar>

      <Divider />

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile, row on larger screens
          flexGrow: 1,
          p: 2,
          gap: 2, // Add gap between elements
        }}
      >
        {/* Element Bar */}
        <Paper
          sx={{
            width: { xs: "100%", sm: "30%" }, // Full width on mobile, 30% on larger screens
            p: 2,
            borderRadius: 2,
            backgroundColor: "white",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h6" mb={2} color="#1DA1F2" fontWeight="bold">
            Elements
          </Typography>
          <List
            sx={{
              display: { xs: "flex", sm: "block" }, // Flex layout on mobile, block on larger screens
              flexDirection: "row", // Horizontal layout on mobile
              gap: { xs: 2, sm: 0 }, // Add gap between items on mobile
            }}
          >
            {elements.map((element) => (
              <ListItem
                button
                key={element.id}
                onClick={() => handleSelectElement(element)}
                sx={{
                  width: { xs: "auto", sm: "100%" }, // Auto width on mobile, full width on larger screens
                  flexShrink: 0, // Prevent shrinking on mobile
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
              >
                <ListItemText primary={element.label} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Form Creation Area */}
        <Paper
          sx={{
            flexGrow: 1,
            p: 3,
            borderRadius: 2,
            backgroundColor: "white",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h6" mb={2} color="#1DA1F2" fontWeight="bold">
            Create Form
          </Typography>
          {selectedElements.map((el) => (
            <Box key={el.id} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter Label"
                value={el.customLabel}
                onChange={(e) => handleLabelChange(el.id, e.target.value)}
                sx={{ mr: 2 }}
              />
              <IconButton onClick={() => handleDeleteElement(el.id)}>
                <DeleteIcon color="error" />
              </IconButton>
              {["select", "radio", "checkbox"].includes(el.type) && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Add Option"
                    value={entityInputs[el.id] || ""}
                    onChange={(e) =>
                      setEntityInputs({ ...entityInputs, [el.id]: e.target.value })
                    }
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleAddEntity(el.id, entityInputs[el.id])}
                  >
                    Add
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </Paper>
      </Box>

      {/* Preview Button */}
      <Button
        variant="contained"
        onClick={() => setPreviewOpen(true)}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          backgroundColor: "#1DA1F2",
          "&:hover": { backgroundColor: "#0d8ae8" },
        }}
      >
        Preview
      </Button>

      {/* Preview Modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            maxHeight: "80vh", // Set max height for the modal
            overflowY: "auto", // Make it scrollable
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h6" mb={2} color="#1DA1F2" fontWeight="bold">
            Preview
          </Typography>
          {selectedElements.map((el) => (
            <Box key={el.id} sx={{ mb: 2 }}>
              <Typography fontWeight="bold" color="text.primary">
                {el.customLabel}
              </Typography>
              {el.type === "text" ||
              el.type === "email" ||
              el.type === "number" ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder={el.customLabel}
                />
              ) : el.type === "select" ? (
                <FormControl fullWidth>
                  <Select>
                    {el.options.map((option, index) => (
                      <MenuItem key={index} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : el.type === "radio" ? (
                <RadioGroup>
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
                    control={<Checkbox />}
                    label={option}
                  />
                ))
              ) : el.type === "image" ? (
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(el.id, e)}
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
                      Selected File: {fileNames[el.id].name}
                    </Typography>
                  )}
                </Box>
              ) : null}
            </Box>
          ))}
          {/* Submit Button */}
          <Button
            variant="contained"
            onClick={handleSubmitForm}
            sx={{ mt: 2, width: "100%", backgroundColor: "#1DA1F2", "&:hover": { backgroundColor: "#0d8ae8" } }}
          >
            Submit Form
          </Button>
        </Box>
      </Modal>
    </Box>
  ); 
};

export default CreateForm;