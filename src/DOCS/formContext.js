import React, { createContext, useState } from "react";

// Create a context for form data
export const FormContext = createContext();

// Create a provider component
export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    logo: "",
  });

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  );
};