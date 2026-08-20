import React from 'react';

export default function AppointmentCard({ patientName, doctorName, date, timeSlot, status }) {
  // Normalize status string for CSS class styling
  const normalizedStatus = (status || 'pending').toLowerCase();

  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <div className="patient-info">
          <h3>👤 {patientName || 'Anonymous Patient'}</h3>
        </div>
        <span className={`status-badge ${normalizedStatus}`}>
          {normalizedStatus}
        </span>
      </div>

      <div className="doctor-info">
        <span>👨‍⚕️</span>
        <span>{doctorName || 'Assigned Specialist'}</span>
      </div>

      <div className="appointment-details">
        <div>📅 <strong>Date:</strong> {date || 'N/A'}</div>
        <div>⏰ <strong>Slot:</strong> {timeSlot || 'N/A'}</div>
      </div>
    </div>
  );
}
