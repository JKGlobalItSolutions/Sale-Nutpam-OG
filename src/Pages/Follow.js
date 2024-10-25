import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar/Navbar";
import { Link } from "react-router-dom";
import "../Styles/Follow.css";
import { fetchLeadsFromFirestore, updateLeadInFirestore, fetchProfilePicture } from "../firebase/firebase";

const Follow = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isNewSidebarVisible, setIsNewSidebarVisible] = useState(false);
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  useEffect(() => {
    const unsubscribe = fetchLeadsFromFirestore(setTasks);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const getProfilePicture = async () => {
      const url = await fetchProfilePicture();
      setProfilePictureUrl(url);
    };
    getProfilePicture();
  }, []);

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

  const filteredTasks = tasks.filter((task) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      task.name.toLowerCase().includes(searchLower) ||
      task.companyName.toLowerCase().includes(searchLower);

    const matchesDate =
      !dateFilter || (task.followUpDate && task.followUpDate === dateFilter);

    return matchesSearch && matchesDate;
  });

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedTask(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSelectedTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await updateLeadInFirestore(selectedTask.id, selectedTask);
    handleModalClose();
  };

  const renderCell = (value) => (value ? value : "-");

  const renderStatusBadge = (status) => {
    switch (status) {
      case "Overdue":
        return <span className="badge bg-danger">{renderCell(status)}</span>;
      case "Due Today":
        return <span className="badge bg-warning text-dark">{renderCell(status)}</span>;
      case "Upcoming":
        return <span className="badge bg-success">{renderCell(status)}</span>;
      case "Completed":
        return <span className="badge bg-primary">{renderCell(status)}</span>;
      default:
        return <span className="badge bg-secondary">-</span>;
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
            toggleSidebar={toggleSidebar}
            toggleMobileSidebar={toggleMobileSidebar}
            profilePictureUrl={profilePictureUrl}
          />

          <div
            className="content-wrapper"
            style={{
              padding: "20px",
              flex: 1,
              overflowY: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="main-content mt-0" style={{ flex: 1, overflowY: "auto" }}>
              <h2 className="fw-bolder" style={{ color: "#FF0000" }}>Follow-Up</h2>

              <div className="col-12 col-lg-6">
                <nav style={{ backgroundColor: "white" }} aria-label="">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/home" style={{ color: "#FF0000" }}>Home</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Follow-Up
                    </li>
                  </ol>
                </nav>
              </div>

              <div className="">
                <div className="d-flex justify-content-between mb-3">
                  <input
                    type="date"
                    className="form-control w-50 mx-1"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control w-50 mx-1"
                    placeholder="Name, Client Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="table-responsive" style={{ overflowX: "auto" }}>
                  <table className="table table-bordered" style={{ minWidth: "800px" }}>
                    <thead className="table-light">
                      <tr>
                        <th style={{ minWidth: "150px" }}>Name</th>
                        <th style={{ minWidth: "150px" }}>Email</th>
                        <th style={{ minWidth: "150px" }}>Lead Name</th>
                        <th style={{ minWidth: "150px" }}>Company Name</th>
                        <th style={{ minWidth: "150px" }}>Description</th>
                        <th style={{ minWidth: "150px" }}>Contact</th>
                        <th style={{ minWidth: "150px" }}>Location</th>
                        <th style={{ minWidth: "150px" }}>Follow-Up Date</th>
                        <th style={{ minWidth: "150px" }}>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((task) => (
                        <tr key={task.id}>
                          <td>{renderCell(task.name)}</td>
                          <td>{renderCell(task.email)}</td>
                          <td>{renderCell(task.leadName)}</td>
                          <td>{renderCell(task.companyName)}</td>
                          <td>{renderCell(task.description)}</td>
                          <td>{renderCell(task.contact)}</td>
                          <td>{renderCell(task.location)}</td>
                          <td>{renderCell(task.followUpDate)}</td>
                          <td>{renderStatusBadge(task.status)}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleEditClick(task)}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalVisible && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal show" style={{ display: "block", zIndex: 1050 }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Follow-Up</h5>
                  <button type="button" className="btn-close" onClick={handleModalClose}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleFormSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={selectedTask?.name || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={selectedTask?.email || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="leadName" className="form-label">Lead Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="leadName"
                        name="leadName"
                        value={selectedTask?.leadName || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="companyName" className="form-label">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="companyName"
                        name="companyName"
                        value={selectedTask?.companyName || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        id="description"
                        name="description"
                        value={selectedTask?.description || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="contact" className="form-label">Contact</label>
                      <input
                        type="text"
                        className="form-control"
                        id="contact"
                        name="contact"
                        value={selectedTask?.contact || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="location" className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        id="location"
                        name="location"
                        value={selectedTask?.location || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="followUpDate" className="form-label">Follow-Up Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="followUpDate"
                        name="followUpDate"
                        value={selectedTask?.followUpDate || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select
                        className="form-select"
                        id="status"
                        name="status"
                        value={selectedTask?.status || ""}
                        onChange={handleFormChange}
                      >
                        <option value="">Select Status</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Due Today">Due Today</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={handleModalClose}>Close</button>
                      <button type="submit" className="btn btn-primary">Save changes</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Follow;
