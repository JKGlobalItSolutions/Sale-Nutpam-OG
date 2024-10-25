// src/contexts/ProfileContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfilePicture } from '../firebase/firebase'; // Adjust the path if necessary

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const url = await getProfilePicture(); // Fetch the profile picture URL from Firebase
        setProfilePictureUrl(url);
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };
    
    fetchProfilePicture();
  }, []);

  return (
    <ProfileContext.Provider value={{ profilePictureUrl, setProfilePictureUrl }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  return useContext(ProfileContext);
};
