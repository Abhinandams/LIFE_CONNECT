import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
// import "./AccidentReports.css";

const AccidentReports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const snapshot = await getDocs(collection(db, "accidentReports"));
      const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(reportsData);
    };
    fetchReports();
  }, []);

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
