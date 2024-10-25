import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../images/logo.jpg";
import LeadManagementicon from "../images/lead management icon.png";
import FollowUPIcon from "../images/Follow-Up Management.png";
import SettingsIcon from "../images/setting icon.png";
import LogoutIcon from "../images/logout Icon.png";
import dashicon from "../images/dashicon1.png";
import './Sidebar.css'; // Ensure the Sidebar.css file is correctly set up for styles

const Sidebar = ({
  isSidebarVisible,
  isNewSidebarVisible,
  isLogoVisible,
  sidebarWidth,
  toggleMobileSidebar,
  isMobileSidebarVisible,
  isMobileOrTablet
}) => {
  const location = useLocation(); // Get the current location
  const navigate = useNavigate(); // Use useNavigate for navigation

  // Logout handler
  const handleLogout = () => {
    // Perform your logout logic here, e.g., clearing tokens or session data
    // Then redirect to the logout page and replace the history
    navigate('/logout', { replace: true }); // Use replace to prevent going back

    // After logout, disable back button navigation
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', function (event) {
      window.history.pushState(null, null, window.location.href);
    });
  };

  // Prevent going back to a previous page after logging out or being on the login page
  useEffect(() => {
    if (location.pathname === '/logout' || location.pathname === '/login') {
      // Disable the back button when on the login or logout page
      window.history.pushState(null, null, window.location.href);
      window.addEventListener('popstate', function (event) {
        window.history.pushState(null, null, window.location.href);
      });
    }
  }, [location]);

  return (
    <>
      {/* Sidebar for desktop */}
      {!isMobileOrTablet && (
        <div
          style={{ width: `${sidebarWidth}px`, backgroundColor: "red" }} // Red background for desktop sidebar
          className={`sidebar text-center position-fixed p-3`}
        >
          {isLogoVisible && (
            <img className="img-fluid rounded mb-4 mt-4 bg-light" src={logo} alt="Logo" />
          )}
          {isNewSidebarVisible ? (
            <div className="new-icons">
              <h3>Icon1</h3>
              <h3>Icon2</h3>
              <h3>Icon3</h3>
            </div>
          ) : (
            <div>
              <Link className="link" to="/home">
                <div className={`sidebar-item ${location.pathname === '/home' ? 'active' : ''}`}>
                  <img
                    className="sidebar-icon"
                    src={dashicon}
                    alt="Dashboard Icon"
                  />
                  <span className="sidebar-text">Dashboard</span>
                </div>
              </Link>

              <Link className="link" to="/leadmanagement">
                <div className={`sidebar-item ${location.pathname === '/leadmanagement' ? 'active' : ''}`}>
                  <img
                    className="sidebar-icon"
                    src={LeadManagementicon}
                    alt="Lead Management Icon"
                  />
                  <span className="sidebar-text">Lead Management</span>
                </div>
              </Link>

              <Link className="link" to="/follow">
                <div className={`sidebar-item ${location.pathname === '/follow' ? 'active' : ''}`}>
                  <img
                    className="sidebar-icon"
                    src={FollowUPIcon}
                    alt="Follow-Ups Icon"
                  />
                  <span className="sidebar-text">Follow-Ups</span>
                </div>
              </Link>

              <Link className="link" to="/settings">
                <div className={`sidebar-item ${location.pathname === '/settings' ? 'active' : ''}`}>
                  <img
                    className="sidebar-icon"
                    src={SettingsIcon}
                    alt="Settings Icon"
                  />
                  <span className="sidebar-text">Settings</span>
                </div>
              </Link>

              <div className="link" onClick={handleLogout} style={{ cursor: "pointer" }}>
                <div className={`sidebar-item ${location.pathname === '/logout' ? 'active' : ''}`}>
                  <img
                    className="sidebar-icon"
                    src={LogoutIcon}
                    alt="Logout Icon"
                  />
                  <span className="sidebar-text">Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sliding Sidebar for Mobile */}
      {isMobileOrTablet && (
        <div
          className={`mobile-sidebar ${isMobileSidebarVisible ? "active" : ""} d-flex flex-column align-items-start`}
          style={{ backgroundColor: "red" }} // Red background for mobile sidebar
        >
          <button
            className="btn btn-light position-absolute top-0 end-0 m-3 text-danger fw-bolder"
            onClick={toggleMobileSidebar}
          >
            Close
          </button>

          <div className="text-light mb-4 mt-3">
            <img style={{ height: "40px" }} className="img-fluid bg-light rounded" src={logo} alt="Logo" />
          </div>

          <Link className="link" to="/home">
            <div className={`fw-bolder px-3 py-3 mobile-dashboard ${location.pathname === '/home' ? 'active' : ''}`}>
              <img className="mobile-sidebar-icon" src={dashicon} alt="Dashboard Icon" />
              <span className="mobile-sidebar-text">Dashboard</span>
            </div>
          </Link>

          <Link className="link" to="/leadmanagement">
            <div className={`fw-bolder px-3 py-3 ${location.pathname === '/leadmanagement' ? 'active' : ''}`}>
              <img className="mobile-sidebar-icon" src={LeadManagementicon} alt="Lead Management Icon" />
              <span style={{ fontWeight: "400" }} className="mobile-sidebar-text">Lead Management</span>
            </div>
          </Link>

          <Link className="link" to="/follow">
            <div className={`fw-bolder px-3 py-3 ${location.pathname === '/follow' ? 'active' : ''}`}>
              <img className="mobile-sidebar-icon" src={FollowUPIcon} alt="Follow-Ups Icon" />
              <span style={{ fontWeight: "400" }} className="mobile-sidebar-text">Follow-Ups</span>
            </div>
          </Link>

          <Link className="link" to="/settings">
            <div className={`fw-bolder px-3 py-3 ${location.pathname === '/settings' ? 'active' : ''}`}>
              <img className="mobile-sidebar-icon" src={SettingsIcon} alt="Settings Icon" />
              <span style={{ fontWeight: "400" }} className="mobile-sidebar-text">Settings</span>
            </div>
          </Link>

          <div className="link" onClick={handleLogout} style={{ cursor: "pointer" }}>
            <div className={`fw-bolder px-3 py-3 ${location.pathname === '/logout' ? 'active' : ''}`}>
              <img className="mobile-sidebar-icon" src={LogoutIcon} alt="Logout Icon" />
              <span style={{ fontWeight: "400" }} className="mobile-sidebar-text">Logout</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
