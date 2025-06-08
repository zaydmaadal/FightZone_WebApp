import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQ6071ZiuxzavWN7FYmpXCm2WBCQNEq2s",
  authDomain: "fightzone-uploads.firebaseapp.com",
  projectId: "fightzone-uploads",
  storageBucket: "fightzone-uploads.firebasestorage.app",
  messagingSenderId: "874472940887",
  appId: "1:874472940887:web:8cb6fabde3210aeb490a12",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { file, name } = req.body;

    if (!file || !name) {
      return res.status(400).json({
        success: false,
        error: "File and name are required",
      });
    }

    // Validate file type
    if (!file.startsWith("data:image/")) {
      return res.status(400).json({
        success: false,
        error: "Only image files are allowed",
      });
    }

    // Extract base64 data
    const base64Data = file.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const fileExtension = name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, `profiles/${fileName}`);

    // Upload to Firebase Storage
    await uploadBytes(storageRef, buffer, {
      contentType: `image/${fileExtension}`,
    });

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return res.status(200).json({
      success: true,
      url: downloadURL,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      error: "Upload failed",
      details: error.message,
    });
  }
}
