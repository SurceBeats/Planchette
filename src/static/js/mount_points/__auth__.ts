import React from "react";
import { createRoot } from "react-dom/client";
import "../../css/global.css";
import AuthPage from "../AuthPage.jsx";

function parseData(id: string): any {
  const el = document.getElementById(id)?.textContent;
  if (!el) return null;
  try { return JSON.parse(el); } catch { return null; }
}

const authData = parseData("data-auth") || { page: "login", flash: [] };

createRoot(document.getElementById("auth-root")!).render(
  React.createElement(AuthPage, { mode: authData.page, flash: authData.flash })
);
