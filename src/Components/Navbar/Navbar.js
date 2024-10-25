import React from "react";
import { useNavigate } from 'react-router-dom';
import menu from './images/menu button.png';
import './Navbar.css'; // Import the CSS file

const Navbar = ({ isMobileOrTablet, toggleMobileSidebar, profilePictureUrl }) => {
  const navigate = useNavigate(); // Hook to programmatically navigate

  const handleProfileClick = () => {
    navigate('/settings'); // Navigate to settings page
  };

  return (
    <nav className="d-flex align-items-center justify-content-between w-100 px-2">
      <div className="col text-start">
        {isMobileOrTablet && (
          <img
            className="menu-icon img-fluid ms-3"
            src={menu}
            alt="Menu"
            onClick={toggleMobileSidebar}
          />
        )}
      </div>
      <div className="col text-end me-3">
        <img
          src={profilePictureUrl || "https://via.placeholder.com/50"}
          alt={profilePictureUrl ? "Profile" : "Default Profile"}
          className="rounded-circle profile-icon img-fluid"
          style={{ height: "50px", width: "50px", objectFit: 'cover' }}
          onClick={handleProfileClick} // Add click handler
        />
      </div>
    </nav>
  );
};

export default Navbar;
