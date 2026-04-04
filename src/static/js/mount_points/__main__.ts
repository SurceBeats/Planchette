import React from "react";
import { createRoot } from "react-dom/client";
import "../../css/global.css";
import PlanchetteBoard from "../PlanchetteBoard.jsx";
import { ThemeProvider } from "../themes.jsx";

createRoot(document.getElementById("root")!).render(React.createElement(ThemeProvider, null, React.createElement(PlanchetteBoard)));
