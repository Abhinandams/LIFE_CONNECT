<b><h1> **LifeConnect - Emergency Response System 🚑🩸**</b></h1>

## **Project Overview**  
LifeConnect is an emergency response system designed to assist users in **blood donation requests** and **accident reporting**. It features a **React-based frontend** and a **Firebase-powered backend**, ensuring real-time assistance and seamless communication.  

Additionally, LifeConnect includes an **AI Chatbot powered by Gemini API**, allowing users to ask queries related to blood requirements and accident reporting.  

---

## **🚀 Features**  
### **🩸 Blood Requirements Module**  
- Search for blood donors based on type and location.  
- Request blood donations and notify nearby donors.  
- Check real-time blood bank availability.  

### **🚑 Accident Reporting Module**  
- Report accidents and provide location details.  
- Notify emergency contacts automatically using **Firebase Cloud Messaging (FCM)**.  
- Connect to ambulance, police, and fire services.  
---

## **🛠 Tech Stack**  
### **Frontend:**  
- React  
- HTML, CSS, JavaScript  

### **Backend:**  
- Firebase (Firestore, Authentication, Cloud Functions, Cloud Messaging)
- Python Flask and Twilio

### **AI & Integrations:**  
- **Google Maps API** (Location tracking for accident reporting)  
- **Firebase Cloud Messaging (FCM)** (Emergency alerts)  

---

## **🛠 Setup Instructions**  

### **1. Clone the Repository**  
```sh
git clone https://github.com/your-repo/LifeConnect.git
cd LifeConnect
```

---

## **📌 Backend Setup (Firebase)**  
1. Create a Firebase project in the **[Firebase Console](https://console.firebase.google.com/)**.  
2. Enable **Authentication, Firestore, Cloud Functions, and Cloud Messaging (FCM)**.  
3. Download the `firebase-config.js` file and place it in `/backend`.  

### **Install Firebase CLI and Deploy**  
```sh
npm install -g firebase-tools
firebase login
cd backend
firebase init
firebase deploy
```

---

## **📌 Frontend Setup (React)**  
1. Navigate to the frontend directory and install dependencies:  
   ```sh
   cd frontend
   npm install
   ```  
2. Add Firebase credentials to a `.env` file.  
3. Start the development server:  
   ```sh
   npm start
   ```  

---

## **🚀 Running the Application**  
1. Ensure both **backend (Firebase)** and **frontend (React)** are set up.  
2. Open in browser:  
   ```sh
   http://localhost:3000
   ```  

---

## **🙌 Acknowledgements**  
- **Firebase** for backend infrastructure and Cloud Messaging (FCM).  
- **Gemini API** for AI chatbot functionality.  
- **Google Maps API** for location tracking in accident reporting.  

---
