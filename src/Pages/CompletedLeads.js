import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar/Navbar";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  getDownloadURL,
} from "firebase/storage";

const CompletedLeads = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isNewSidebarVisible, setIsNewSidebarVisible] = useState(false);
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState("dashboard");
  const [completedTasks, setCompletedTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  // Function to fetch the user's profile picture from Firebase Storage
  const fetchProfilePicture = async (userEmail) => {
    try {
      const userEmailFolder = userEmail.replace(/[@.]/g, "_");
      const imageRef = ref(storage, `profilePictures/${userEmailFolder}/profile.jpg`);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch the profile picture URL
        const url = await fetchProfilePicture(user.email);
        setProfilePictureUrl(url);
        console.log("Profile picture URL:", url);
        
        // Fetch completed leads
        const userEmail = user.email;
        const completedLeadsRef = collection(db, "adminCollections", userEmail, "leads");
        const completedQuery = query(completedLeadsRef, where("status", "==", "Completed"));

        const unsubscribeLeads = onSnapshot(completedQuery, (snapshot) => {
          const leads = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCompletedTasks(leads);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching completed leads:", error);
          setLoading(false);
        });

        return () => {
          unsubscribeLeads();
        };
      } else {
        setProfilePictureUrl(null);
        setCompletedTasks([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [auth, db]);

  const filteredTasks = completedTasks.filter((task) => {
    const matchesSearchTerm =
      task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate ? task.followUpDate === selectedDate : true;
    return matchesSearchTerm && matchesDate;
  });

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
    setIsNewSidebarVisible(false);
  };

  const toggleNewSidebar = () => {
    setIsNewSidebarVisible((prev) => !prev);
    setIsLogoVisible((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarVisible((prev) => !prev);
  };

  const isMobileOrTablet = window.innerWidth <= 768;
  const sidebarWidth = isSidebarVisible && !isMobileOrTablet ? 300 : isMobileSidebarVisible ? 0 : 100;

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
          activeItem={activeSidebarItem}
          setActiveItem={setActiveSidebarItem}
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

          <div className="content-wrapper" style={{ padding: "20px", flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column" }}>
            <div className="main-content mt-0" style={{ flex: 1, overflowY: "auto" }}>
              <h2 className="fw-bolder" style={{ color: "#FF0000" }}>
                Completed Leads
              </h2>
              <div className="row align-items-center">
                <div className="col-12 col-lg-6">
                  <nav style={{ backgroundColor: "white" }} aria-label="">
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item">
                        <Link to="/home" style={{ color: "#FF0000" }}>
                          Home
                        </Link>
                      </li>
                      <li className="breadcrumb-item active" aria-current="page">
                        Completed Leads
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
              <div className="row">
                <div className="col-12 col-lg-6">
                  <input
                    type="text"
                    placeholder="Search by Name or Email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control mb-2"
                  />
                </div>
                <div className="col-12 col-lg-6">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Completed Leads Table */}
              <div className="table-responsive">
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Lead Name</th>
                        <th>Company Name</th>
                        <th>Task Description</th>
                        <th>Contact</th>
                        <th>Follow-Up Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                          <tr key={task.id}>
                            <td>{task.name || "-"}</td>
                            <td>{task.email || "-"}</td>
                            <td>{task.leadName || "-"}</td>
                            <td>{task.companyName || "-"}</td>
                            <td>{task.taskDescription || "-"}</td>
                            <td>{task.contact || "-"}</td>
                            <td>{task.followUpDate || "-"}</td>
                            <td>{task.status || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center">
                            No completed leads found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedLeads;
