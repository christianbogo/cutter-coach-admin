import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarLayout } from "./components/layout/SidebarLayout";

// Import other components as needed

function App() {
  return (
    <BrowserRouter>
      <SidebarLayout>
        <Routes>
          {/* People Routes */}
          <Route path="/people" element={<p>People Page</p>} />
          <Route path="/people/new" element={<p>New Person Page</p>} />
          <Route path="/people/:id" element={<p>Edit Person Page</p>} />

          {/* Team Routes */}
          <Route path="/teams" element={<p>Teams Page</p>} />
          <Route path="/teams/new" element={<p>New Team Page</p>} />
          <Route path="/teams/:id" element={<p>Edit Team Page</p>} />

          {/* ... Define routes for other entities (Seasons, Athletes, etc.) */}
          <Route path="/seasons" element={<p>Seasons Page</p>} />
          <Route path="/athletes" element={<p>Athletes Page</p>} />
          <Route path="/meets" element={<p>Meets Page</p>} />
          <Route path="/events" element={<p>Events Page</p>} />
          <Route path="/results" element={<p>Results Page</p>} />

          {/* Redirect to a default route */}
          <Route path="/" element={<Navigate to="/people" replace />} />
        </Routes>
      </SidebarLayout>
    </BrowserRouter>
  );
}

export default App;
