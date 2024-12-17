'use client';

import React from "react";
import { ThemeProvider } from "./components/theme-provider";
import App from "./App";
import "./index.css";

export default function Page() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
