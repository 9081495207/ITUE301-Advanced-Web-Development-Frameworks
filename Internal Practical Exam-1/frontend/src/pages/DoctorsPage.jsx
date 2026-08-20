import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DoctorsPage() {
  // Task 4: Maintain three distinct states
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task 4: useEffect hook to make API call on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Asynchronous API call to Express backend
      const response = await axios.get('/api/v1/doctors');
      
      if (response.data && response.data.success) {
        setData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to load doctors list');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to the backend REST API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Medical Specialists & Doctors</h1>
        <p className="page-subtitle">View available doctors and their medical specialisations</p>
      </div>

      {/* 1. Display loading message/indicator while request in progress */}
      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <p style={{ fontWeight: 600, color: 'var(--primary)' }}>Fetching doctor records from REST API...</p>
        </div>
      )}

      {/* 2. Display error message if request fails */}
      {error && !loading && (
        <div className="error-banner">
          <h3>⚠️ API Consumption Error</h3>
          <p>{error}</p>
          <button 
            onClick={fetchDoctors} 
            className="btn-primary" 
            style={{ width: 'auto', marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            Retry Request
          </button>
        </div>
      )}

      {/* 3. Display doctor data after a successful request */}
      {!loading && !error && (
        <div className="cards-grid">
          {data.map((doctor, idx) => (
            <div key={doctor._id || doctor.id || idx} className="doctor-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                  👨‍⚕️ {doctor.name}
                </h3>
                {/* 4. Display Doctor Availability */}
                <span className={`availability-badge ${doctor.available ? 'available' : 'unavailable'}`}>
                  {doctor.available ? '🟢 Available' : '🔴 Unavailable'}
                </span>
              </div>

              {/* 4. Display Doctor Specialisation */}
              <div style={{ fontSize: '1rem', color: 'var(--primary-hover)', fontWeight: 600 }}>
                🩺 {doctor.specialisation}
              </div>

              {doctor.email && (
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  📧 {doctor.email}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
