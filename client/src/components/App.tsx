import { BrowserRouter, Route, Routes } from "react-router";
import React from "react";
import ProtectedRoute from "util/auth";
import Dashboard from "./pages/Dashboard";
import Game from "./pages/Game";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Test page */}
        <Route path="/" element={<ProtectedRoute element={<Game />} />} />

        {/* Main (non-game) pages */}
        <Route path="/login" Component={Login} />
        <Route path="/signup" Component={Signup} />

        {/* Protected Routes */}
        {/* <Route path='/' element={<ProtectedRoute element={<Dashboard />} />} /> */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />

        {/* 404 */}
        <Route path="/*" Component={NotFound} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
