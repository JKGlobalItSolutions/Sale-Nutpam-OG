import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar/Navbar";
import addicon from "../images/add icon.png";
import {
  addLeadToFirestore,
  fetchLeadsFromFirestore,
  deleteLeadFromFirestore,
  updateLeadInFirestore,
  fetchProfilePicture,
} from "../firebase/firebase";

const LeadManagement = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isNewSidebarVisible, setIsNewSidebarVisible] = useState(false);
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLeadId, setEditLeadId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    leadName: "",
    companyName: "",
    contact: "",
    location: "",
    followUpDate: "",
    leadDate: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  useEffect(() => {
    const unsubscribe = fetchLeadsFromFirestore(setLeads);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfilePic = async () => {
      const url = await fetchProfilePicture();
      setProfilePictureUrl(url);
    };
    fetchProfilePic();
  }, []);

  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  const handleAddLead = async (newLead) => {
    await addLeadToFirestore(newLead);
    handleCloseAddModal();
  };

  const handleShowEditModal = (lead) => {
    setEditLeadId(lead.id);
    setFormData({ ...lead, followUpDate: lead.followUpDate });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditLeadId(null);
    resetFormData();
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      leadName: "",
      companyName: "",
      contact: "",
      location: "",
      followUpDate: "",
      leadDate: new Date().toISOString().split("T")[0],
      description: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    if (editLeadId !== null) {
      await updateLeadInFirestore(editLeadId, formData);
      handleCloseEditModal();
    }
  };

  const handleDeleteClick = async (id) => {
    await deleteLeadFromFirestore(id);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact.includes(searchQuery) ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation = filterLocation ? lead.location === filterLocation : true;
    const matchesDate = filterDate ? lead.followUpDate === filterDate : true;

    return matchesSearch && matchesLocation && matchesDate;
  });

  const isMobileOrTablet = window.innerWidth <= 768;
  const sidebarWidth = isSidebarVisible && !isMobileOrTablet ? 300 : isMobileSidebarVisible ? 0 : 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLead = { ...formData };
    handleAddLead(newLead);
    resetFormData();
  };

  return (
    <div className="container-fluid" style={{ height: "100vh", overflow: "hidden", padding: 0 }}>
      <div className="row w-100 ms-0" style={{ height: "100%" }}>
        <Sidebar
          isSidebarVisible={isSidebarVisible}
          isNewSidebarVisible={isNewSidebarVisible}
          isLogoVisible={isLogoVisible}
          sidebarWidth={sidebarWidth}
          toggleMobileSidebar={() => setIsMobileSidebarVisible(!isMobileSidebarVisible)}
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
            overflow: "hidden",
            margin: 0,
            padding: 0,
          }}
          className="main-content d-flex flex-column"
        >
          <Navbar
            isMobileOrTablet={isMobileOrTablet}
            toggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
            toggleMobileSidebar={() => setIsMobileSidebarVisible(!isMobileSidebarVisible)}
            profilePictureUrl={profilePictureUrl}
          />

          <div className="content-wrapper" style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <h2 className="fw-bolder" style={{ color: "#FF0000" }}>Leads</h2>

            <div className="row align-items-center">
              <div className="col-12 col-lg-6">
                <nav style={{ backgroundColor: "white" }} aria-label="">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/home" style={{ color: "#FF0000" }}>Home</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Lead Management
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="col-12 col-lg-6 text-end">
                <img
                  src={addicon}
                  alt="Add Icon"
                  style={{ height: '30px', cursor: 'pointer' }}
                  onClick={handleShowAddModal}
                />
              </div>
            </div>

            <div className="row my-3">
              <div className="col-md-6 col-12 d-flex align-items-center mb-3 mb-lg-none">
                <input
                  type="date"
                  className="form-control me-2"
                  onChange={(e) => setFilterDate(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="col-md-6 col-12">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter by Location"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover table-striped table-bordered" style={{ minWidth: '800px' }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: '150px' }}>Name</th>
                    <th style={{ minWidth: '150px' }}>Lead Name</th>
                    <th style={{ minWidth: '120px' }}>Lead Date</th>
                    <th style={{ minWidth: '150px' }}>Company Name</th>
                    <th>Description</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th style={{ minWidth: '150px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td>{lead.name}</td>
                        <td>{lead.leadName}</td>
                        <td>{lead.leadDate}</td>
                        <td>{lead.companyName}</td>
                        <td>{lead.description}</td>
                        <td>{lead.contact}</td>
                        <td>{lead.location}</td>
                        <td>
                          <div className="d-flex justify-content-start">
                            <button className="btn btn-warning me-2" onClick={() => handleShowEditModal(lead)}>
                              Edit
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDeleteClick(lead.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">No leads found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Lead</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="leadName" className="form-label">Lead Name</label>
              <input
                type="text"
                className="form-control"
                id="leadName"
                name="leadName"
                value={formData.leadName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="companyName" className="form-label">Company Name</label>
              <input
                type="text"
                className="form-control"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="contact" className="form-label">Contact</label>
              <input
                type="text"
                className="form-control"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="location" className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="followUpDate" className="form-label">Follow Up Date</label>
              <input
                type="date"
                className="form-control"
                id="followUpDate"
                name="followUpDate"
                value={formData.followUpDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="leadDate" className="form-label">Lead Date</label>
              <input
                type="date"
                className="form-control"
                id="leadDate"
                name="leadDate"
                value={formData.leadDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">Add Lead</button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Edit Lead Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Lead</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSaveClick}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="leadName" className="form-label">Lead Name</label>
              <input
                type="text"
                className="form-control"
                id="leadName"
                name="leadName"
                value={formData.leadName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="companyName" className="form-label">Company Name</label>
              <input
                type="text"
                className="form-control"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="contact" className="form-label">Contact</label>
              <input
                type="text"
                className="form-control"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="location" className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="followUpDate" className="form-label">Follow Up Date</label>
              <input
                type="date"
                className="form-control"
                id="followUpDate"
                name="followUpDate"
                value={formData.followUpDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="leadDate" className="form-label">Lead Date</label>
              <input
                type="date"
                className="form-control"
                id="leadDate"
                name="leadDate"
                value={formData.leadDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LeadManagement;
