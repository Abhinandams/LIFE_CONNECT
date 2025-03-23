import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/AccidentReporting.css";

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to update map dynamically
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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Get User's Location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setLatLng([latitude, longitude]);
        setLocation(`Lat: ${latitude}, Lng: ${longitude}`);

        // Fetch address using OpenStreetMap API
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data.display_name) {
            setLocationName(data.display_name);
          } else {
            setLocationName("Unknown location");
          }
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
    // Stop any existing camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    setIsCameraOpen(true);
    try {
      const constraints = {
        video: { facingMode: useFrontCamera ? "user" : "environment" },
      };
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

    // Convert to base64 URL for preview
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    setImage(imageDataUrl);

    // Stop camera stream
    if (video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please capture an image before submitting.");
      return;
    }

    try {
      await addDoc(collection(db, "accidentReports"), {
        location,
        locationName,
        description,
        contact,
        imageUrl: image, // Base64 Image
        timestamp: new Date(),
      });
      alert("Accident Report Submitted Successfully!");
      navigate("/accident-reports");
    } catch (error) {
      console.error("Error submitting accident report:", error);
    }
  };

  return (
    <div className="report-container">
      <h2>Report an Accident</h2>
      <form onSubmit={handleSubmit}>
        <label>Location:</label>
        <input type="text" value={location} readOnly />
        <button type="button" onClick={getLocation}>Use Current Location</button>

        <label>Address:</label>
        <input type="text" value={locationName} readOnly />

        {/* Map */}
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

        {/* Camera Controls */}
        <button type="button" onClick={startCamera}>Capture Photo</button>
        <button
          type="button"
          onClick={() => {
            setUseFrontCamera((prev) => !prev);
            startCamera(); // Restart camera when switching
          }}
        >
          Switch to {useFrontCamera ? "Back" : "Front"} Camera
        </button>

        {/* Camera Preview */}
        {isCameraOpen && (
          <div>
            <video ref={videoRef} autoPlay style={{ width: "100%" }} />
            <button type="button" onClick={capturePhoto}>Take Photo</button>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Display Captured Image */}
        {image && <img src={image} alt="Captured preview" style={{ width: "100%", marginTop: "10px" }} />}

        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
};

export default AccidentReporting;
