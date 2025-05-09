import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FormProvider } from "./DOCS/formContext"; 
import "./App.css";
import LoginPage from "./DOCS/Login";
import Dashboard from "./DOCS/Dashboard";
import Createform from "./DOCS/Createform";
import FormPage from "./DOCS/FormPage"; 

const App = () => {
  return (
    <Router>
      <FormProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-form" element={<Createform />} />
          <Route path="/forms/:id" element={<FormPage />} /> 
        </Routes>
      </FormProvider>
    </Router>
  );
};

export default App;
