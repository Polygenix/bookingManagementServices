
const mongoose = require("mongoose");
const patientRepository = require("../repositories/patientRepository");

const validateId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid patient ID");
    error.statusCode = 400;
    throw error;
  }
};

// CREATE PATIENT
const createPatient = async (customerId, data) => {
  const requiredFields = [
    "patientName",
    "age",
    "gender",
    "phone",
  ];

  for (const field of requiredFields) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      String(data[field]).trim() === ""
    ) {
      const error = new Error(`${field} is required`);
      error.statusCode = 400;
      throw error;
    }
  }

  if (!Number.isInteger(Number(data.age)) || Number(data.age) < 1 || Number(data.age) > 120) {
    const error = new Error("Age must be between 1 and 120");
    error.statusCode = 400;
    throw error;
  }

  const allowedGenders = ["Male", "Female", "Other"];

  if (!allowedGenders.includes(data.gender)) {
    const error = new Error("Invalid gender");
    error.statusCode = 400;
    throw error;
  }

  const patientData = {
    patientName: data.patientName,
    age: Number(data.age),
    gender: data.gender,
    phone: data.phone,
    email: data.email || "",
    relationship: data.relationship || "Self",
    customer: customerId,
  };

  return await patientRepository.createPatient(patientData);
};

// GET ALL PATIENTS
const getAllPatients = async (customerId) => {
  return await patientRepository.getAllPatients(customerId);
};

// GET PATIENT BY ID
const getPatientById = async (id, customerId) => {
  validateId(id);

  const patient = await patientRepository.getPatientById(
    id,
    customerId
  );

  if (!patient) {
    const error = new Error("Patient not found");
    error.statusCode = 404;
    throw error;
  }

  return patient;
};

// UPDATE PATIENT
const updatePatient = async (id, customerId, data) => {
  validateId(id);

  const allowedFields = [
    "patientName",
    "age",
    "gender",
    "phone",
    "email",
    "relationship",
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    const error = new Error("No valid fields provided for update");
    error.statusCode = 400;
    throw error;
  }

  if (
    updateData.patientName !== undefined &&
    !String(updateData.patientName).trim()
  ) {
    const error = new Error("Patient name cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  if (updateData.age !== undefined) {
    if (
      !Number.isInteger(Number(updateData.age)) ||
      Number(updateData.age) < 1 ||
      Number(updateData.age) > 120
    ) {
      const error = new Error("Age must be between 1 and 120");
      error.statusCode = 400;
      throw error;
    }

    updateData.age = Number(updateData.age);
  }

  if (
    updateData.gender !== undefined &&
    !["Male", "Female", "Other"].includes(updateData.gender)
  ) {
    const error = new Error("Invalid gender");
    error.statusCode = 400;
    throw error;
  }

  if (
    updateData.relationship !== undefined &&
    !["Self", "Father", "Mother", "Spouse", "Child", "Other"].includes(updateData.relationship)
  ) {
    const error = new Error("Invalid relationship");
    error.statusCode = 400;
    throw error;
  }

  const patient = await patientRepository.updatePatient(
    id,
    customerId,
    updateData
  );

  if (!patient) {
    const error = new Error("Patient not found");
    error.statusCode = 404;
    throw error;
  }

  return patient;
};

// DELETE PATIENT
const deletePatient = async (id, customerId) => {
  validateId(id);

  const patient = await patientRepository.deletePatient(
    id,
    customerId
  );

  if (!patient) {
    const error = new Error("Patient not found");
    error.statusCode = 404;
    throw error;
  }

  return patient;
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
