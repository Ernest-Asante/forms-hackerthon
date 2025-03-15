import React, { useState, useContext, useEffect } from "react";
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
  IconButton,
  Modal,
  TextField,
  Drawer,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { FormContext } from "./formContext"; 
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore"; 
import { db } from "../firebase-config"; 
import "../App.css";

const organization = {
  name: "GESA KNUST",
  logo: "https://picsum.photos/300/200", 
};

const Dashboard = () => {
  const [forms, setForms] = useState([]); 
  const [drawerOpen, setDrawerOpen] = useState(false); 
  const [modalOpen, setModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [file, setFile] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null); 
  const [userResponses, setUserResponses] = useState([]); 
  const [selectedResponse, setSelectedResponse] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { setFormData } = useContext(FormContext); 

  
  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      try {
        const formsCollection = collection(db, "forms"); 
        const formsSnapshot = await getDocs(formsCollection); 
        const formsData = formsSnapshot.docs.map((doc) => ({
          id: doc.id, 
          title: doc.data().title, 
        }));
        setForms(formsData); 
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []); 

  
  const handleFormClick = async (formId) => {
    setLoading(true);
    try {
      
      const formDoc = await getDoc(doc(db, "forms", formId));
      if (formDoc.exists()) {
        setSelectedForm(formDoc.data()); 
      } else {
        console.error("Form not found");
      }

      
      const userFormsCollection = collection(db, "user-forms");
      const userFormsQuery = query(userFormsCollection, where("formId", "==", formId));
      const userFormsSnapshot = await getDocs(userFormsQuery);
      const userResponsesData = userFormsSnapshot.docs.map((doc) => ({
        id: doc.id, 
        ...doc.data(), 
      }));
      setUserResponses(userResponsesData); 
    } catch (error) {
      console.error("Error fetching form data or user responses:", error);
    } finally {
      setLoading(false);
    }
  };

  
  const handleResponseClick = (response) => {
    setSelectedResponse(response); 
  };

  const handleCreateForm = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleContinue = () => {
    setModalOpen(false);
    
    setFormData({
      title: formTitle,
      description: formDescription,
      logo: file,
    });
    navigate("/create-form");
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setFile(file);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", flexDirection: "column", backgroundColor: "#f5f5f5" }}>
      {/* AppBar */}
      <AppBar elevation={0} position="static" sx={{ backgroundColor: "white", boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center", color: "#1DA1F2", fontWeight: "bold" }}>
            {organization.name}
          </Typography>
          {isSmallScreen && (
            <IconButton edge="end" color="#1DA1F2" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Divider />

      {/* Drawer for small screens */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, height: "100%", backgroundColor: "background.paper" }}>
          <Typography variant="h6" sx={{ p: 2, backgroundColor: "white", color: "#1DA1F2", textAlign: "center", fontWeight: "bold" }}>
            My Forms
          </Typography>
          <List>
            {forms.map((form) => (
              <ListItem button key={form.id} onClick={() => { handleFormClick(form.id); setDrawerOpen(false); }}>
                <ListItemText primary={form.title} secondary={`ID: ${form.id}`} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        {/* Sidebar for larger screens */}
        {!isSmallScreen && (
          <Paper
            elevation={0}
            sx={{
              flex: 4,
              height: "calc(100vh - 64px)",
              position: "fixed",
              left: 0,
              top: "70px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              width: "25%",
              backgroundColor: "white",
              boxShadow: "2px 0px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h6" sx={{ p: 2, backgroundColor: "white", color: "#1DA1F2", textAlign: "center", fontWeight: "bold" }}>
              My Forms
            </Typography>
            <Box className="scroll-container">
              <List>
                {forms.map((form) => (
                  <ListItem button key={form.id} onClick={() => handleFormClick(form.id)}>
                    <ListItemText primary={form.title} secondary={`ID: ${form.id}`} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        )}

        {/* Main Content Area */}
        <Box
          sx={{
            flex: 8,
            ml: isSmallScreen ? 0 : "25%",
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {loading ? (
            <CircularProgress color="primary" />
          ) : selectedForm ? (
            <Box sx={{ width: "100%", maxWidth: 800 }}>
              <Typography variant="h4" fontWeight="bold" mb={3} color="#1DA1F2">
                {selectedForm.title}
              </Typography>
              <Typography variant="body1" mb={3} color="text.secondary">
                {selectedForm.description}
              </Typography>
              {selectedForm.logo && (
                <Avatar src={selectedForm.logo} alt="Form Logo" sx={{ width: 100, height: 100, mb: 3 }} />
              )}


                <Typography variant="body1" mb={3}>
                <strong>Form Link:</strong>{" "}
                <a
                  href={`http://localhost:3000/forms/${selectedForm.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  http://localhost:3000/forms/{selectedForm.id}
                </a>
              </Typography>

              <Chip
                label={`Responses: ${userResponses.length}`}
                color="primary"
                sx={{ mb: 3, fontSize: "1rem", fontWeight: "bold" }}
              />

              <List>
                {userResponses.map((response) => (
                  <ListItem
                    button
                    key={response.id}
                    onClick={() => handleResponseClick(response)}
                    sx={{ mb: 2, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", borderRadius: 2 }}
                  >
                    <ListItemText
                      primary={`Response ID: ${response.id}`}
                      secondary={`Submitted by: ${response.userInfo.name}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            // Display the "Create Form" button if no form is selected
            <>
              <Typography variant="h4" fontWeight="bold" mb={3} color="#1DA1F2">
                Create a New Form
              </Typography>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#1DA1F2",
                  color: "#fff",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.2rem",
                  "&:hover": { backgroundColor: "#0d8ae8" },
                }}
                onClick={handleCreateForm}
              >
                Create Form
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Modal to display response details */}
      <Modal open={!!selectedResponse} onClose={() => setSelectedResponse(null)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            maxHeight: "80vh",
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" mb={2} color="#1DA1F2" fontWeight="bold">
            Response Details
          </Typography>
          {selectedResponse && (
            <Box>
              {Object.entries(selectedResponse.responses).map(([key, value]) => (
                <Box key={key} sx={{ mb: 2 }}>
                  <Typography variant="body1" fontWeight="bold" color="text.primary">
                    {key}:
                  </Typography>
                  {typeof value === "string" &&
                  value.startsWith("https://firebasestorage.googleapis.com") ? (
                    <img
                      src={value}
                      alt={key}
                      style={{ maxWidth: "100%", height: "auto", marginTop: 8, borderRadius: 8 }}
                    />
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      {JSON.stringify(value)}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Modal>

      {/* Modal to create a new form */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
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
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" mb={2} color="#1DA1F2" fontWeight="bold">
            Create New Form
          </Typography>
          <TextField
            label="Form Title"
            fullWidth
            variant="outlined"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            variant="outlined"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: 16 }} />
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Selected"
              style={{ width: "100%", borderRadius: 8, marginBottom: 16, height: 200 }}
            />
          )}
          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#1DA1F2",
              "&:hover": { backgroundColor: "#0d8ae8" },
            }}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Dashboard;
