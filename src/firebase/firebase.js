// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCSNdQKxu1nxSC0mZx-rXiTxBZQw-BHaY",
  authDomain: "salenutpam-og.firebaseapp.com",
  projectId: "salenutpam-og",
  storageBucket: "salenutpam-og.appspot.com",
  messagingSenderId: "1020144465263",
  appId: "1:1020144465263:web:47dd39a211bbaf37cb649a",
  measurementId: "G-BL61YF9EJ3",
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Function to delete the previous image from Firebase Storage
const deletePreviousImage = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const userEmailFolder = user.email.replace(/[@.]/g, "_");
    const imageRef = ref(storage, `profilePictures/${userEmailFolder}/profile.jpg`);

    await deleteObject(imageRef);
    console.log("Previous image deleted successfully");
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      console.log("No previous image to delete");
    } else {
      console.error("Error deleting previous image: ", error);
    }
  }
};

// Function to upload an image to Firebase Storage and return the download URL
const uploadImageToStorage = async (file) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const userEmailFolder = user.email.replace(/[@.]/g, "_");

  await deletePreviousImage();

  const storageRef = ref(storage, `profilePictures/${userEmailFolder}/profile.jpg`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Error uploading image: ", error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("Image uploaded successfully:", downloadURL);
        resolve(downloadURL);
      }
    );
  });
};

// Function to fetch the user's profile picture from Firebase Storage
const fetchProfilePicture = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const userEmailFolder = user.email.replace(/[@.]/g, "_");
    const imageRef = ref(storage, `profilePictures/${userEmailFolder}/profile.jpg`);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    return null;
  }
};

// Function to handle fetching and setting the profile picture (even after refresh)
const fetchAndSetProfilePicture = (setProfilePicture) => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const url = await fetchProfilePicture();
      setProfilePicture(url);
    } else {
      setProfilePicture(null);
    }
  });

  return unsubscribe;
};

// Function to add a lead to Firestore
const addLeadToFirestore = async (lead) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const leadDocRef = doc(collection(doc(db, "adminCollections", user.email), "leads"));
    await setDoc(leadDocRef, lead);
    console.log("Lead added successfully");
  } catch (error) {
    console.error("Error adding lead:", error);
  }
};

// Function to update a lead in Firestore
const updateLeadInFirestore = async (id, lead) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const leadDocRef = doc(collection(doc(db, "adminCollections", user.email), "leads"), id);
    await setDoc(leadDocRef, lead, { merge: true });
    console.log("Lead updated successfully");
  } catch (error) {
    console.error("Error updating lead:", error);
  }
};

// Function to fetch leads from Firestore and subscribe to changes
const fetchLeadsFromFirestore = (setLeads) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      const leadsCollection = collection(doc(db, "adminCollections", user.email), "leads");

      const unsubscribeLeads = onSnapshot(
        leadsCollection,
        (snapshot) => {
          const leads = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setLeads(leads);
        },
        (error) => {
          console.error("Error fetching leads:", error);
          setLeads([]);
        }
      );

      return unsubscribeLeads;
    } else {
      setLeads([]);
    }
  });

  return unsubscribe;
};

// Function to delete a lead from Firestore
const deleteLeadFromFirestore = async (id) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const leadDocRef = doc(collection(doc(db, "adminCollections", user.email), "leads"), id);
    await deleteDoc(leadDocRef);
    console.log("Lead deleted successfully");
  } catch (error) {
    console.error("Error deleting lead:", error);
  }
};

// Function to save user settings to Firestore
const saveSettingsToFirestore = async (settings) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const settingsDocRef = doc(collection(doc(db, "adminCollections", user.email), "settings"), "userSettings");
    await setDoc(settingsDocRef, settings);
    console.log("Settings saved successfully");
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

// Function to fetch user settings from Firestore and subscribe to changes
const fetchSettingsFromFirestore = (setSettings) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      const settingsDocRef = doc(collection(doc(db, "adminCollections", user.email), "settings"), "userSettings");

      const unsubscribeSettings = onSnapshot(
        settingsDocRef,
        (doc) => {
          if (doc.exists()) {
            setSettings(doc.data());
          } else {
            setSettings(null);
          }
        },
        (error) => {
          console.error("Error fetching settings:", error);
        }
      );

      return unsubscribeSettings;
    } else {
      setSettings(null);
    }
  });

  return unsubscribe;
};

// Export functions and Firebase instances
export {
  auth,
  db,
  storage,
  uploadImageToStorage,
  addLeadToFirestore,
  fetchLeadsFromFirestore,
  deleteLeadFromFirestore,
  updateLeadInFirestore,
  saveSettingsToFirestore,
  fetchSettingsFromFirestore,
  fetchProfilePicture,
  fetchAndSetProfilePicture,
};
