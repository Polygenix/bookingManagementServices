
const Patient = require("../models/Patient");

// CREATE PATIENT
const createPatient = async (data) => {
  return await Patient.create(data);
};

// GET ALL PATIENTS
const getAllPatients = async (customerId) => {
  return await Patient.find({ customer: customerId })
    .sort({ createdAt: -1 });
};

// GET PATIENT BY ID
const getPatientById = async (id, customerId) => {
  return await Patient.findOne({
    _id: id,
    customer: customerId,
  });
};

// UPDATE PATIENT
const updatePatient = async (id, customerId, data) => {
  return await Patient.findOneAndUpdate(
    {
      _id: id,
      customer: customerId,
    },
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// DELETE PATIENT
const deletePatient = async (id, customerId) => {
  return await Patient.findOneAndDelete({
    _id: id,
    customer: customerId,
  });
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
