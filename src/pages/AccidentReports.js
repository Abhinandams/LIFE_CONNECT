import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const AccidentReports = () => {
  const [reports, setReports] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    
    const fetchReports = async () => {
      const q = query(collection(db, "accidentReports"), where("userEmail", "==", user.email));
      const snapshot = await getDocs(q);
      const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(reportsData);
    };
    
    fetchReports();
  }, [user]);

  return (
    <div className="reports-container">
      <h2>Recent Accident Reports</h2>
      {reports.map((report) => (
        <div key={report.id} className="report-card">
          <p><strong>Location:</strong> {report.location}</p>
          <p><strong>Description:</strong> {report.description}</p>
          <p><strong>Contact:</strong> {report.contact}</p>
          {report.imageUrl && <img src={report.imageUrl} alt="Accident" />}
        </div>
      ))}
    </div>
  );
};

export default AccidentReports;
