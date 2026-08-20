import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppointmentCard from '../components/AppointmentCard';

export default function HomePage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/appointments');
      if (response.data && response.data.data) {
        setAppointments(response.data.data);
      }
    } catch (err) {
      console.warn('Backend unavailable, using initial sample appointments.');
      setAppointments([
        { patientName: 'Aarav Mehta', doctorName: 'Dr. Rajesh Sharma', date: '2026-08-25', timeSlot: '10:00 AM', status: 'confirmed' },
        { patientName: 'Diya Kapoor', doctorName: 'Dr. Ananya Patel', date: '2026-08-26', timeSlot: '02:30 PM', status: 'pending' },
        { patientName: 'Karan Joshi', doctorName: 'Dr. Vikram Malhotra', date: '2026-08-27', timeSlot: '11:15 AM', status: 'cancelled' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Hospital Appointment Dashboard</h1>
        <p className="page-subtitle">Welcome to MedCare Plus Patient Portal & Appointment Management System</p>
      </div>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#1e293b' }}>Recent Scheduled Appointments</h2>
        
        {loading ? (
          <div className="state-container">
            <div className="spinner"></div>
            <p>Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="state-container">
            <p>No appointments recorded yet.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {appointments.map((appt, idx) => (
              <AppointmentCard
                key={appt._id || appt.id || idx}
                patientName={appt.patientName || (appt.patientId && appt.patientId.name)}
                doctorName={appt.doctorName || (appt.doctorId && appt.doctorId.name)}
                date={appt.date}
                timeSlot={appt.timeSlot}
                status={appt.status}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
