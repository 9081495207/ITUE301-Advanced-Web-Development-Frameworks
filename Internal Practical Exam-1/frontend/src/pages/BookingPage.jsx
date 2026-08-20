import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function BookingPage() {
  const navigate = useNavigate();

  // Task 2: useState state value 1 - Controlled form data
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: 'Dr. Rajesh Sharma',
    date: '',
    timeSlot: '10:00 AM',
    reason: '',
    status: 'pending'
  });

  // Task 2: useState state value 2 - Selected doctor details / meta
  const [selectedDoctor, setSelectedDoctor] = useState({
    name: 'Dr. Rajesh Sharma',
    specialisation: 'Cardiology'
  });

  // useState state value 3 - Doctors dropdown list & submission feedback state
  const [doctorsList, setDoctorsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Fetch doctors list for dropdown
    axios.get('/api/v1/doctors')
      .then(res => {
        if (res.data && res.data.data) {
          setDoctorsList(res.data.data);
          if (res.data.data.length > 0) {
            setFormData(prev => ({ ...prev, doctorName: res.data.data[0].name }));
            setSelectedDoctor({
              name: res.data.data[0].name,
              specialisation: res.data.data[0].specialisation
            });
          }
        }
      })
      .catch(() => {
        setDoctorsList([
          { name: 'Dr. Rajesh Sharma', specialisation: 'Cardiology' },
          { name: 'Dr. Ananya Patel', specialisation: 'Neurology' },
          { name: 'Dr. Vikram Malhotra', specialisation: 'Pediatrics' },
          { name: 'Dr. Suresh Mehta', specialisation: 'Orthopedics' }
        ]);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update selected doctor state if doctor changes
    if (name === 'doctorName') {
      const doc = doctorsList.find(d => d.name === value);
      if (doc) {
        setSelectedDoctor({
          name: doc.name,
          specialisation: doc.specialisation
        });
      } else {
        setSelectedDoctor({
          name: value,
          specialisation: 'General Specialist'
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await axios.post('/api/v1/appointments', formData);
      if (response.data && response.data.success) {
        setMessage({ type: 'success', text: 'Appointment booked successfully!' });
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to book appointment. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Book an Appointment</h1>
        <p className="page-subtitle">Fill in patient details to schedule a consultation with our medical specialists</p>
      </div>

      {message && (
        <div className={message.type === 'success' ? 'status-badge confirmed' : 'error-banner'} style={{ marginBottom: '1.5rem', padding: '1rem', width: '100%' }}>
          {message.text}
        </div>
      )}

      <div className="booking-form-container">
        {/* Appointment Form */}
        <form onSubmit={handleSubmit} className="booking-form">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Appointment Request Form</h2>

          <div className="form-group">
            <label htmlFor="patientName">Patient Name *</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="e.g. Aarav Mehta"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="doctorName">Doctor Name *</label>
            <select
              id="doctorName"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              className="form-control"
              required
            >
              {doctorsList.length > 0 ? (
                doctorsList.map((doc, i) => (
                  <option key={doc._id || doc.id || i} value={doc.name}>
                    {doc.name} ({doc.specialisation})
                  </option>
                ))
              ) : (
                <option value="Dr. Rajesh Sharma">Dr. Rajesh Sharma (Cardiology)</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeSlot">Time Slot *</label>
            <select
              id="timeSlot"
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:30 AM">11:30 AM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="04:30 PM">04:30 PM</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Visit</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Brief description of your medical query (max 300 chars)"
              maxLength={300}
              className="form-control"
              rows={3}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Submitting...' : 'Confirm Appointment'}
          </button>
        </form>

        {/* Live Reactive State Display (Task 2 Requirement) */}
        <div className="live-preview-box">
          <h3>⚡ Live Form State Preview</h3>
          <p style={{ fontSize: '0.875rem', color: '#0369a1', marginBottom: '1.25rem' }}>
            Demonstrates real-time state binding using <code>useState</code> hooks.
          </p>

          <div className="preview-field">
            👤 <strong>Entered Patient Name:</strong>{' '}
            <span style={{ color: formData.patientName ? '#0284c7' : '#94a3b8' }}>
              {formData.patientName || '(Waiting for input...)'}
            </span>
          </div>

          <div className="preview-field">
            👨‍⚕️ <strong>Selected Doctor:</strong>{' '}
            <span>{selectedDoctor.name}</span>
          </div>

          <div className="preview-field">
            🩺 <strong>Doctor Specialisation:</strong>{' '}
            <span>{selectedDoctor.specialisation}</span>
          </div>

          <div className="preview-field">
            📅 <strong>Selected Date:</strong>{' '}
            <span>{formData.date || 'Not selected'}</span>
          </div>

          <div className="preview-field">
            ⏰ <strong>Time Slot:</strong>{' '}
            <span>{formData.timeSlot}</span>
          </div>

          <div className="preview-field" style={{ marginTop: '1rem' }}>
            🏷️ <strong>Initial Status:</strong>{' '}
            <span className="status-badge pending">pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
