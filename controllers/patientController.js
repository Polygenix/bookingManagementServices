
const patientService = require("../services/patientService");

const getCustomerId = (req) => req.user.id || req.user._id;

// Create Patient
const createPatient = async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(
      getCustomerId(req),
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Patient added successfully",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Patients
const getAllPatients = async (req, res, next) => {
  try {
    const patients = await patientService.getAllPatients(
      getCustomerId(req)
    );

    res.status(200).json({
      success: true,
      total: patients.length,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

// Get Patient By ID
const getPatientById = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientById(
      req.params.id,
      getCustomerId(req)
    );

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// Update Patient
const updatePatient = async (req, res, next) => {
  try {
    const patient = await patientService.updatePatient(
      req.params.id,
      getCustomerId(req),
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Patient
const deletePatient = async (req, res, next) => {
  try {
    const patient = await patientService.deletePatient(
      req.params.id,
      getCustomerId(req)
    );

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
