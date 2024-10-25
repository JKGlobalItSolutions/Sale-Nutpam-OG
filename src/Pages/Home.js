import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar/Navbar";
import { Bar } from "react-chartjs-2";
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchLeadsFromFirestore, fetchProfilePicture } from "../firebase/firebase"; // Adjust this if needed
import CompletedLeads from "./CompletedLeads";
import { onAuthStateChanged } from "firebase/auth"; // Import onAuthStateChanged
import { auth } from "../firebase/firebase"; // Import your auth object

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Home = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isNewSidebarVisible, setIsNewSidebarVisible] = useState(false);
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalFollowUps, setTotalFollowUps] = useState(0);
  const [completedLeads, setCompletedLeads] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch the profile picture
    const getProfilePicture = async () => {
      try {
        const url = await fetchProfilePicture(); // Fetch the image URL from Firebase
        console.log("Fetched Profile Picture URL:", url); // Debug log
        setProfilePictureUrl(url);
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    // Subscribe to auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        getProfilePicture(); // Fetch the profile picture when user is authenticated
      } else {
        setProfilePictureUrl(""); // Reset the profile picture if not authenticated
      }
    });

    const unsubscribeLeads = fetchLeadsFromFirestore((leads) => {
      const leadCount = leads.length;
      setTotalLeads(leadCount);
      setTotalFollowUps(leadCount);

      const completed = leads.filter(lead => lead.status === "Completed");
      setCompletedLeads(completed);
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeAuth();
      unsubscribeLeads();
    };
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

  const data = {
    labels: ["Total Leads", "Total Follow-Ups", "Completed Leads"],
    datasets: [
      {
        label: "Counts",
        data: [totalLeads, totalFollowUps, completedLeads.length],
        backgroundColor: ["#FF0000", "#FFA500", "#008000"],
        borderColor: ["#FF0000", "#FFA500", "#008000"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleViewCompletedClick = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
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
            overflow: "hidden",
            margin: 0,
            padding: 0,
          }}
          className="main-content d-flex flex-column"
        >
          <Navbar
            isMobileOrTablet={isMobileOrTablet}
            toggleSidebar={toggleSidebar}
            toggleMobileSidebar={toggleMobileSidebar}
            profilePictureUrl={profilePictureUrl} // Pass the profile picture URL here
          />

          <div
            className="content-wrapper"
            style={{
              height: "calc(100vh - 56px)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <div className="main-content mt-0" style={{ flex: 1, overflowY: "auto" }}>
              <h2 className="fw-bolder" style={{ color: "#FF0000" }}>Dashboard</h2>

              <div className="row mb-4">
                <div className="col-md-4 d-flex">
                  <div className="card animated-card shadow w-100" style={{ padding: "20px", borderRadius: "10px", backgroundColor: "#f8f9fa" }}>
                    <h4>Total Leads</h4>
                    <p className="lead" style={{ fontSize: "24px", color: "#ff0000" }}>{totalLeads}</p>
                    <button style={{ backgroundColor: "red" }} onClick={() => navigate("/leadmanagement")} className="btn btn-danger">
                      View Leads
                    </button>
                  </div>
                </div>
                <div className="col-md-4 d-flex">
                  <div className="card animated-card shadow w-100" style={{ padding: "20px", borderRadius: "10px", backgroundColor: "#f8f9fa" }}>
                    <h4>Total Follow-Ups</h4>
                    <p className="lead" style={{ fontSize: "24px", color: "#FF0000" }}>{totalFollowUps}</p>
                    <button style={{ backgroundColor: "red" }} onClick={() => navigate("/follow")} className="btn btn-danger">
                      View Follow-Ups
                    </button>
                  </div>
                </div>
                <div className="col-md-4 d-flex">
                  <div className="card animated-card shadow w-100" style={{ padding: "20px", borderRadius: "10px", backgroundColor: "#f8f9fa" }}>
                    <h4>Leads Completed</h4>
                    <p className="lead" style={{ fontSize: "24px", color: "#FF0000" }}>{completedLeads.length}</p>
                    <button style={{ backgroundColor: "red" }} onClick={() => navigate("/complete")} className="btn btn-danger">
                      View All
                    </button>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <div className="card shadow" style={{ padding: "20px", borderRadius: "10px", backgroundColor: "#f8f9fa", height: "400px" }}>
                    <h4>Analytics Chart</h4>
                    <div style={{ height: "100%" }}>
                      <Bar data={data} options={options} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalVisible && (
        <CompletedLeads 
          completedLeads={completedLeads} 
          onClose={handleModalClose} 
        />
      )}
    </div>
  );
};

export default Home;
