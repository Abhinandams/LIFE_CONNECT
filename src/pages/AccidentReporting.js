import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, GeoPoint } from "firebase/firestore";
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
  const [showOverview, setShowOverview] = useState(false); // Overview modal state
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [isNotifying, setIsNotifying] = useState(false);
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

    // Stop camera stream
    if (video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
  };

  // Calculate distance between two points in km using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Find nearby emergency services
  const findNearbyServices = async (latitude, longitude, maxDistance = 10) => {
    const services = {
      hospitals: [],
      ambulances: [],
      police: []
    };

    try {
      // Query hospitals collection
      const hospitalsSnapshot = await getDocs(collection(db, "hospitals"));
      hospitalsSnapshot.forEach(doc => {
        const hospital = doc.data();
        // Check if hospital has location data
        if (hospital.location) {
          const distance = calculateDistance(
            latitude, 
            longitude, 
            hospital.location.split(",")[0], 
            hospital.location.split(",")[1]
          );
          
          if (distance <= maxDistance) {
            services.hospitals.push({
              id: doc.id,
              name: hospital.name,
              contact: hospital.contact,
              email: hospital.email,
              distance: distance.toFixed(2)
            });
          }
        }
      });

      // Query ambulances collection
      const ambulancesSnapshot = await getDocs(collection(db, "ambulances"));
      ambulancesSnapshot.forEach(doc => {
        const ambulance = doc.data();
        if (ambulance.location) {
          const distance = calculateDistance(
            latitude, 
            longitude, 
            ambulance.location.split(",")[0], 
            ambulance.location.split(",")[1]
          );
          
          if (distance <= maxDistance) {
            services.ambulances.push({
              id: doc.id,
              name: ambulance.name || "Ambulance Unit",
              contact: ambulance.contact,
              distance: distance.toFixed(2)
            });
          }
        }
      });

      // Query police collection
      const policeSnapshot = await getDocs(collection(db, "police"));
      policeSnapshot.forEach(doc => {
        const police = doc.data();
        if (police.location) {
          const distance = calculateDistance(
            latitude, 
            longitude, 
            police.location.split(",")[0], 
            police.location.split(",")[1]
          );
          
          if (distance <= maxDistance) {
            services.police.push({
              id: doc.id,
              name: police.name || "Police Station",
              contact: police.contact,
              distance: distance.toFixed(2)
            });
          }
        }
      });

      return services;
    } catch (error) {
      console.error("Error finding nearby services:", error);
      throw error;
    }
  };

  // Send notifications to emergency services
  const sendEmergencyNotifications = async (reportId, services) => {
    const timestamp = new Date();
    const notifications = [];

    // Create notification for each hospital
    for (const hospital of services.hospitals) {
      notifications.push(
        addDoc(collection(db, "notifications"), {
          recipient: "hospital",
          recipientId: hospital.id,
          reportId: reportId,
          type: "emergency",
          title: "Emergency: Accident Reported Nearby",
          message: `An accident has been reported ${hospital.distance}km from your location at ${locationName}. Immediate assistance may be required.`,
          location: location,
          locationName: locationName,
          status: "unread",
          timestamp: timestamp
        })
      );
    }

    // Create notification for each ambulance
    for (const ambulance of services.ambulances) {
      notifications.push(
        addDoc(collection(db, "notifications"), {
          recipient: "ambulance",
          recipientId: ambulance.id,
          reportId: reportId,
          type: "emergency",
          title: "Emergency: Accident Reported - Medical Assistance Needed",
          message: `An accident has been reported ${ambulance.distance}km from your location at ${locationName}. Please respond immediately.`,
          location: location,
          locationName: locationName,
          status: "unread",
          timestamp: timestamp
        })
      );
    }

    // Create notification for each police station
    for (const police of services.police) {
      notifications.push(
        addDoc(collection(db, "notifications"), {
          recipient: "police",
          recipientId: police.id,
          reportId: reportId,
          type: "emergency",
          title: "Emergency: Accident Reported - Police Assistance Needed",
          message: `An accident has been reported ${police.distance}km from your location at ${locationName}. Please respond immediately.`,
          location: location,
          locationName: locationName,
          status: "unread",
          timestamp: timestamp
        })
      );
    }

    // Wait for all notifications to be sent
    await Promise.all(notifications);
    return {
      hospitalsNotified: services.hospitals.length,
      ambulancesNotified: services.ambulances.length,
      policeNotified: services.police.length,
      totalNotified: services.hospitals.length + services.ambulances.length + services.police.length
    };
  };

  // Show Overview Modal Before Submission
  const showOverviewModal = (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please capture an image before submitting.");
      return;
    }
    setShowOverview(true);
  };

  // Handle Form Submission
  const handleSubmit = async () => {
    setIsNotifying(true);
    try {
      // 1. Save accident report first
      const reportRef = await addDoc(collection(db, "accidentReports"), {
        location,
        locationName,
        description,
        contact,
        imageUrl: image,
        timestamp: new Date(),
        // Add a GeoPoint for better geospatial queries in the future
        geoPoint: new GeoPoint(latlng[0], latlng[1])
      });

      // 2. Find nearby emergency services
      const nearbyServices = await findNearbyServices(latlng[0], latlng[1]);
      
      // 3. Send notifications to those services
      const notificationResults = await sendEmergencyNotifications(
        reportRef.id, 
        nearbyServices
      );

      setNotificationStatus(notificationResults);
      alert(`Accident Report Submitted Successfully! Notified ${notificationResults.totalNotified} emergency services.`);
      navigate("/accident-reports");
    } catch (error) {
      console.error("Error submitting accident report:", error);
      setNotificationStatus({ error: "Failed to notify emergency services" });
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <div className="report-container">
      <h2>Report an Accident</h2>
      <form onSubmit={showOverviewModal}>
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

        <button type="submit">Submit Report</button>
      </form>

      {/* Overview Modal */}
      {showOverview && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Your Report</h3>
            <p><strong>Location:</strong> {location}</p>
            <p><strong>Address:</strong> {locationName}</p>
            <p><strong>Description:</strong> {description}</p>
            <p><strong>Contact:</strong> {contact}</p>
            {image && <img src={image} alt="Preview" style={{ width: "100%", marginTop: "10px" }} />}
            
            {isNotifying && <p className="notification-status">Notifying emergency services...</p>}
            
            {notificationStatus && !notificationStatus.error && (
              <div className="notification-results">
                <p><strong>Emergency Services Notified:</strong></p>
                <p>Hospitals: {notificationStatus.hospitalsNotified}</p>
                <p>Ambulances: {notificationStatus.ambulancesNotified}</p>
                <p>Police Stations: {notificationStatus.policeNotified}</p>
              </div>
            )}
            
            {notificationStatus && notificationStatus.error && (
              <p className="notification-error">{notificationStatus.error}</p>
            )}
            
            <div className="modal-buttons">
              <button onClick={handleSubmit} disabled={isNotifying}>
                {isNotifying ? "Notifying Services..." : "Confirm & Submit"}
              </button>
              <button onClick={() => setShowOverview(false)} disabled={isNotifying}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccidentReporting;