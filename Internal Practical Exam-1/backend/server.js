const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from parent root or current directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Task 3: Custom requestLogger middleware
const requestLogger = (req, res, next) => {
  const method = req.method;
  const path = req.originalUrl || req.url;
  const timestamp = new Date().toISOString();
  console.log(`[${method}] [${path}] [${timestamp}]`);
  next();
};

// Apply requestLogger globally
app.use(requestLogger);

// In-memory fallback data with Indian names if MongoDB is disconnected
let inMemoryDoctors = [
  { id: '1', name: 'Dr. Rajesh Sharma', email: 'rajesh.sharma@medcare.com', specialisation: 'Cardiology', available: true },
  { id: '2', name: 'Dr. Ananya Patel', email: 'ananya.patel@medcare.com', specialisation: 'Neurology', available: true },
  { id: '3', name: 'Dr. Vikram Malhotra', email: 'vikram.m@medcare.com', specialisation: 'Pediatrics', available: false },
  { id: '4', name: 'Dr. Suresh Mehta', email: 'suresh.mehta@medcare.com', specialisation: 'Orthopedics', available: true }
];

let inMemoryAppointments = [
  { id: '101', patientName: 'Aarav Mehta', doctorName: 'Dr. Rajesh Sharma', date: '2026-08-25', timeSlot: '10:00 AM', status: 'confirmed', reason: 'Routine Heart Checkup' },
  { id: '102', patientName: 'Diya Kapoor', doctorName: 'Dr. Ananya Patel', date: '2026-08-26', timeSlot: '02:30 PM', status: 'pending', reason: 'Migraine & Headache Consultation' },
  { id: '103', patientName: 'Karan Joshi', doctorName: 'Dr. Vikram Malhotra', date: '2026-08-27', timeSlot: '11:15 AM', status: 'cancelled', reason: 'General Health Checkup' }
];

let isMongoConnected = false;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    isMongoConnected = true;
    console.log(`MongoDB Connected successfully to ${MONGO_URI}`);
    await seedInitialData();
  })
  .catch(err => {
    isMongoConnected = false;
    console.warn(`MongoDB Connection Error: ${err.message}. Operating in in-memory mode.`);
  });

// Seed initial database data with Indian Names
async function seedInitialData() {
  try {
    // Refresh database if non-Indian old names are present
    const oldDoc = await Doctor.findOne({ name: 'Dr. Sarah Jenkins' });
    if (oldDoc) {
      await Doctor.deleteMany({});
      await Patient.deleteMany({});
      await Appointment.deleteMany({});
      console.log('Cleared existing sample data to re-seed Indian names.');
    }

    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      await Doctor.insertMany([
        { name: 'Dr. Rajesh Sharma', email: 'rajesh.sharma@medcare.com', specialisation: 'Cardiology', available: true },
        { name: 'Dr. Ananya Patel', email: 'ananya.patel@medcare.com', specialisation: 'Neurology', available: true },
        { name: 'Dr. Vikram Malhotra', email: 'vikram.m@medcare.com', specialisation: 'Pediatrics', available: false },
        { name: 'Dr. Suresh Mehta', email: 'suresh.mehta@medcare.com', specialisation: 'Orthopedics', available: true }
      ]);
      console.log('Seeded initial Doctors (Indian names) into MongoDB.');
    }

    const patientCount = await Patient.countDocuments();
    let defaultPatient;
    if (patientCount === 0) {
      defaultPatient = await Patient.create({
        name: 'Aarav Mehta',
        email: 'aarav.mehta@example.com',
        phone: '+91 98765 43210',
        bloodGroup: 'O+',
        age: 34
      });
      console.log('Seeded initial Patient (Indian names) into MongoDB.');
    } else {
      defaultPatient = await Patient.findOne();
    }

    const appointmentCount = await Appointment.countDocuments();
    if (appointmentCount === 0) {
      const sampleDoctor = await Doctor.findOne({ name: 'Dr. Rajesh Sharma' }) || await Doctor.findOne();
      await Appointment.insertMany([
        {
          patientId: defaultPatient._id,
          doctorId: sampleDoctor._id,
          patientName: 'Aarav Mehta',
          doctorName: sampleDoctor.name,
          date: '2026-08-25',
          timeSlot: '10:00 AM',
          status: 'confirmed',
          reason: 'Routine Heart Checkup'
        },
        {
          patientId: defaultPatient._id,
          doctorId: sampleDoctor._id,
          patientName: 'Diya Kapoor',
          doctorName: 'Dr. Ananya Patel',
          date: '2026-08-26',
          timeSlot: '02:30 PM',
          status: 'pending',
          reason: 'Migraine & Headache Consultation'
        },
        {
          patientId: defaultPatient._id,
          doctorId: sampleDoctor._id,
          patientName: 'Karan Joshi',
          doctorName: 'Dr. Vikram Malhotra',
          date: '2026-08-27',
          timeSlot: '11:15 AM',
          status: 'cancelled',
          reason: 'General Health Checkup'
        }
      ]);
      console.log('Seeded initial Appointments (Indian names) into MongoDB.');
    }
  } catch (err) {
    console.error('Error seeding initial data:', err.message);
  }
}

// REST Endpoints (Task 3 & Task 5)

// GET /api/v1/doctors - Return all doctors
app.get('/api/v1/doctors', async (req, res, next) => {
  try {
    if (isMongoConnected && mongoose.connection.readyState === 1) {
      const doctors = await Doctor.find();
      return res.status(200).json({
        success: true,
        count: doctors.length,
        data: doctors
      });
    } else {
      return res.status(200).json({
        success: true,
        count: inMemoryDoctors.length,
        data: inMemoryDoctors
      });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/doctors - Create a doctor
app.post('/api/v1/doctors', async (req, res, next) => {
  try {
    const { name, email, specialisation, available } = req.body;
    if (isMongoConnected && mongoose.connection.readyState === 1) {
      const doctor = await Doctor.create({ name, email, specialisation, available });
      return res.status(201).json({
        success: true,
        data: doctor
      });
    } else {
      if (!name || !specialisation) {
        const error = new Error('Doctor name and specialisation are required');
        error.statusCode = 400;
        throw error;
      }
      const newDoc = { id: String(Date.now()), name, email, specialisation, available: available !== undefined ? available : true };
      inMemoryDoctors.push(newDoc);
      return res.status(201).json({
        success: true,
        data: newDoc
      });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/appointments - Return all appointments
app.get('/api/v1/appointments', async (req, res, next) => {
  try {
    if (isMongoConnected && mongoose.connection.readyState === 1) {
      const appointments = await Appointment.find().populate('patientId doctorId');
      return res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } else {
      return res.status(200).json({
        success: true,
        count: inMemoryAppointments.length,
        data: inMemoryAppointments
      });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/appointments - Create a new appointment
app.post('/api/v1/appointments', async (req, res, next) => {
  try {
    const { patientName, doctorName, date, timeSlot, status, reason, patientId, doctorId } = req.body;

    if (isMongoConnected && mongoose.connection.readyState === 1) {
      const appointment = await Appointment.create({
        patientName,
        doctorName,
        date,
        timeSlot,
        status: status || 'pending',
        reason,
        patientId: patientId || undefined,
        doctorId: doctorId || undefined
      });

      return res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: appointment
      });
    } else {
      if (!date || !timeSlot) {
        const error = new Error('Date and timeSlot are required');
        error.statusCode = 400;
        throw error;
      }
      const newAppt = {
        id: String(Date.now()),
        patientName: patientName || 'Aarav Mehta',
        doctorName: doctorName || 'Dr. Rajesh Sharma',
        date,
        timeSlot,
        status: status || 'pending',
        reason: reason || ''
      };
      inMemoryAppointments.unshift(newAppt);
      return res.status(201).json({
        success: true,
        message: 'Appointment created successfully (In-Memory)',
        data: newAppt
      });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/patients - Create a new patient
app.post('/api/v1/patients', async (req, res, next) => {
  try {
    const { name, email, phone, bloodGroup, age } = req.body;
    if (isMongoConnected && mongoose.connection.readyState === 1) {
      const patient = await Patient.create({ name, email, phone, bloodGroup, age });
      return res.status(201).json({
        success: true,
        data: patient
      });
    } else {
      return res.status(201).json({
        success: true,
        data: { id: String(Date.now()), name, email, phone, bloodGroup, age }
      });
    }
  } catch (err) {
    next(err);
  }
});

// Task 5 Demonstration: Endpoint to demonstrate Mongoose validation failures explicitly
app.post('/api/v1/test-validation', async (req, res, next) => {
  try {
    const { type, payload } = req.body;

    if (type === 'patient_invalid_bloodgroup') {
      const patient = new Patient({
        name: 'Validation Test Patient',
        email: `valtest_${Date.now()}@example.com`,
        bloodGroup: 'Z+' // Invalid blood group
      });
      await patient.save();
      return res.status(200).json({ success: true, data: patient });
    }

    if (type === 'patient_missing_required') {
      const patient = new Patient({
        email: `valtest_${Date.now()}@example.com`
        // Missing required 'name'
      });
      await patient.save();
      return res.status(200).json({ success: true, data: patient });
    }

    if (type === 'appointment_invalid_status') {
      const appt = new Appointment({
        date: '2026-09-01',
        timeSlot: '10:00 AM',
        status: 'approved' // Invalid status! allowed: pending, confirmed, cancelled
      });
      await appt.save();
      return res.status(200).json({ success: true, data: appt });
    }

    if (type === 'appointment_reason_exceeded') {
      const longReason = 'A'.repeat(305); // Exceeds 300 characters constraint
      const appt = new Appointment({
        date: '2026-09-01',
        timeSlot: '10:00 AM',
        reason: longReason
      });
      await appt.save();
      return res.status(200).json({ success: true, data: appt });
    }

    // Default payload validation attempt
    const doc = new Patient(payload || {});
    await doc.save();
    return res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

// Task 3 & Task 5: Global error-handling middleware
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR HANDLER]', err.name, ':', err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Mongoose Validation Error (Task 5)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Database Validation Error';
    errors = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errors = err.keyValue;
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  // Structured JSON response without exposing raw error stack
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
});

// Start Server listening on 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT} and http://127.0.0.1:${PORT}`);
});
