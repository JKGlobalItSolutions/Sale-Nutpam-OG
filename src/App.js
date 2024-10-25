import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';   
import Login from './Pages/Login';
import LeadManagement from './Pages/LeadManagement';
import Follow from './Pages/Follow';
import Settings from './Pages/Settings';
import 'animate.css';
import CompletedLeads from './Pages/CompletedLeads';

function App() {
  const [profilePictureUrl, setProfilePictureUrl] = useState(null); // State to hold profile picture URL

  return (
    <div> 
      <Router>
        <Routes>   
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home profilePictureUrl={profilePictureUrl} />} />
          <Route path="/leadmanagement" element={<LeadManagement profilePictureUrl={profilePictureUrl} />} />
          <Route path="/follow" element={<Follow profilePictureUrl={profilePictureUrl} />} />
          <Route path="/settings" element={<Settings setProfilePictureUrl={setProfilePictureUrl} />} />
          <Route path="/logout" element={<Login />} />
          <Route path="/complete" element={<CompletedLeads profilePictureUrl={profilePictureUrl} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
