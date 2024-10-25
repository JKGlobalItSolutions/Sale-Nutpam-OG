import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar/Navbar";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Styles/Settings.css';
import {
  saveSettingsToFirestore,
  fetchSettingsFromFirestore,
  uploadImageToStorage
} from '../firebase/firebase';

const Settings = ({ setProfilePictureUrl }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isNewSidebarVisible, setIsNewSidebarVisible] = useState(false);
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profilePicture: null
  });

  const [profilePictureUrl, setProfilePictureUrlState] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = fetchSettingsFromFirestore((settings) => {
      if (settings) {
        setFormData(settings);
        const fetchedProfilePicture = settings.profilePicture || null;
        setProfilePictureUrlState(fetchedProfilePicture);
        setProfilePictureUrl(fetchedProfilePicture); // Update the global state here
      }
    });

    return () => unsubscribe();
  }, [setProfilePictureUrl]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
    setIsNewSidebarVisible(false);
  };

  const toggleNewSidebar = () => {
    setIsNewSidebarVisible(!isNewSidebarVisible);
    setIsLogoVisible(!isLogoVisible);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarVisible(!isMobileSidebarVisible);
  };

  const isMobileOrTablet = window.innerWidth <= 768;
  const sidebarWidth = isSidebarVisible && !isMobileOrTablet ? 300 : isMobileSidebarVisible ? 0 : 100;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        const downloadURL = await uploadImageToStorage(file);
        setFormData({ ...formData, profilePicture: downloadURL });
        setProfilePictureUrlState(downloadURL); // Update local state
        setProfilePictureUrl(downloadURL); // Update global state
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveSettingsToFirestore(formData);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <div className="container-fluid" style={{ height: "100vh", overflow: "hidden", padding: 0 }}>
      <div className="row w-100 ms-0" style={{ height: "100%" }}>
        <Sidebar
          isSidebarVisible={isSidebarVisible}
          isNewSidebarVisible={isNewSidebarVisible}
          isLogoVisible={isLogoVisible}
          sidebarWidth={sidebarWidth}
          toggleMobileSidebar={toggleMobileSidebar}
          isMobileSidebarVisible={isMobileSidebarVisible}
          isMobileOrTablet={isMobileOrTablet}
        />

        <div
          style={{
            position: "relative",
            top: 0,
            left: isMobileOrTablet ? 0 : `${sidebarWidth}px`,
            right: 0,
            height: "100%",
            width: isMobileOrTablet ? "100%" : `calc(100% - ${sidebarWidth}px)`,
            overflowY: "auto",
            margin: 0,
            padding: 0,
          }}
          className="main-content d-flex flex-column"
        >
          <Navbar
            isMobileOrTablet={isMobileOrTablet}
            toggleMobileSidebar={toggleMobileSidebar}
            profilePictureUrl={profilePictureUrl} // Pass the updated profile picture URL
          />

          <div className="content-wrapper" style={{ padding: "20px", flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column" }}>
            <div className="main-content mt-0" style={{ flex: 1, overflowY: "auto" }}>
              <h2 className="fw-bolder" style={{ color: "#FF0000" }}>Settings</h2>

              <div className="col-12 col-lg-6">
                <nav style={{ backgroundColor: "white" }} aria-label="">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/home" style={{ color: "#FF0000" }}>Home</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">Settings</li>
                  </ol>
                </nav>
              </div>

              <div className="container px-5">
                <form className="rounded p-5" style={{ border: "3px solid red" }} onSubmit={handleSubmit}>
                  <div className="d-flex justify-content-center mb-3">
                    <div className="profile-picture">
                      <input
                        type="file"
                        className="form-control d-none"
                        id="profilePicture"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="profilePicture">
                        <img
                          src={profilePictureUrl || ''}
                          alt="Profile"
                          className="rounded-circle"
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                        <div className="text-center mt-2 text-danger">
                          {isUploading ? "Uploading..." : "Upload Profile Picture"}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name*</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter the Admin person's name"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email*</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter Your Email ID"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number*</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter Your Phone Number"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">Address*</label>
                    <textarea
                      className="form-control"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter Your Address"
                      rows="3"
                      required
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-between">
                    <button type="submit" className="btn btn-danger">Save</button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        address: '',
                        profilePicture: null
                      })}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
