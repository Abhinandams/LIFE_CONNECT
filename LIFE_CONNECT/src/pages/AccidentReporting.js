import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { db, storage, auth } from "../firebase";
import { collection, addDoc, GeoPoint } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/AccidentReporting.css";

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapUpdater = ({ latlng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(latlng, 13);
  }, [latlng, map]);
  return null;
};

const AccidentReporting = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latlng, setLatLng] = useState([51.505, -0.09]); // Default: London
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [image, setImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [useFrontCamera, setUseFrontCamera] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const user = auth.currentUser;

  // Get User's Location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setLatLng([latitude, longitude]);
        setLocation(`Lat: ${latitude}, Lng: ${longitude}`);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setLocationName(data.display_name || "Unknown location");
        } catch (error) {
          console.error("Error fetching address:", error);
          setLocationName("Error fetching address");
        }
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  // Start Camera
  const startCamera = async () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    setIsCameraOpen(true);
    try {
      const constraints = { video: { facingMode: useFrontCamera ? "user" : "environment" } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Camera access denied.");
    }
  };

  // Capture Photo
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setImage(canvas.toDataURL("image/jpeg"));

    if (video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
  };

  // Handle Form Submission
  const handleSubmit = async () => {
    if (!description || !contact || !image) {
      alert("Please fill all fields and capture an image before submitting.");
      return;
    }

    if (!user) {
      alert("You must be logged in to submit a report.");
      return;
    }

    setIsNotifying(true);
    try {
      let imageUrl = null;

      // 1. Upload image to Firebase Storage
      if (image) {
        const storageRef = ref(storage, `accidentReports/${Date.now()}.jpg`);
        const snapshot = await uploadString(storageRef, image, "data_url");
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Save accident report with user email
      await addDoc(collection(db, "accidentReports"), {
        location,
        locationName,
        description,
        contact,
        imageUrl,
        timestamp: new Date(),
        geoPoint: new GeoPoint(latlng[0], latlng[1]),
        userEmail: user.email, // Associate report with the logged-in user
      });

      alert("Accident Report Submitted Successfully!");
      setShowOverview(false);
      navigate("/accident-reports");
    } catch (error) {
      console.error("Error submitting accident report:", error);
      alert("Failed to submit report.");
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <div className="report-container">
      <h2>Report an Accident</h2>
      <form onSubmit={(e) => { e.preventDefault(); setShowOverview(true); }}>
        <label>Location:</label>
        <input type="text" value={location} readOnly />
        <button type="button" onClick={getLocation}>Use Current Location</button>

        <label>Address:</label>
        <input type="text" value={locationName} readOnly />

        <div className="map-container">
          <MapContainer center={latlng} zoom={13} style={{ height: "300px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={latlng} icon={customIcon} />
            <MapUpdater latlng={latlng} />
          </MapContainer>
        </div>

        <label>Description:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />

        <label>Contact Number:</label>
        <input type="tel" value={contact} onChange={(e) => setContact(e.target.value)} required />

        <button type="button" onClick={startCamera}>Capture Photo</button>
        <button type="button" onClick={() => { setUseFrontCamera(prev => !prev); startCamera(); }}>
          Switch to {useFrontCamera ? "Back" : "Front"} Camera
        </button>

        {isCameraOpen && (
          <div>
            <video ref={videoRef} autoPlay style={{ width: "100%" }} />
            <button type="button" onClick={capturePhoto}>Take Photo</button>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />

        {image && <img src={image} alt="Captured preview" style={{ width: "100%", marginTop: "10px" }} />}

        <button type="submit">Preview & Submit</button>
      </form>

      {showOverview && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Your Report</h3>
            <p><strong>Location:</strong> {location}</p>
            <p><strong>Address:</strong> {locationName}</p>
            <p><strong>Description:</strong> {description}</p>
            <p><strong>Contact:</strong> {contact}</p>
            {image && <img src={image} alt="Preview" style={{ width: "100%", marginTop: "10px" }} />}
            <button onClick={handleSubmit} disabled={isNotifying}>
              {isNotifying ? "Submitting..." : "Confirm & Submit"}
            </button>
            <button onClick={() => setShowOverview(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>  
  );
};

export default AccidentReporting;
