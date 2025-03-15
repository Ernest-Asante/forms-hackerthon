import React from "react";
import { Paper, Typography, Box, List, ListItem, ListItemText } from "@mui/material";
import "../App.css";

const Sidebar = ({ forms }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: "80vw", md: 300 }, 
        height: { xs: "100vh", md: "100vh" }, 
        position: { md: "fixed" }, 
        left: 0,
        top: 0,
        overflowY: { md: "auto", xs: "visible" }, 
        display: "flex",
        flexDirection: "column",
        shadow:"none"
      }}
    >   
      <Typography
        variant="h6"
        sx={{
          p: 2,
          backgroundColor: "white",
          color: "black",
          textAlign: "center",
        }}
      >
        My Form
      </Typography>

      <Box
        className="scroll-container"
        sx={{
          overflowY: { md: "auto", xs: "visible" }, // Enable scroll only on large screens
          maxHeight: { md: "calc(100vh - 50px)", xs: "none" }, // Limit height only on large screens
        }}
      >
        <List>
          {forms.map((form) => (
            <ListItem button key={form.id}>
              <ListItemText primary={form.title} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default Sidebar;
