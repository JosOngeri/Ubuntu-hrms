const Contract = require('../models/Contract.model');

exports.createContract = async (req, res) => {
  try {
    const contractData = { ...req.body };
    
    // Multer intercepts the file and places it in req.file
    if (req.file) {
      contractData.documentPath = `/uploads/contracts/${req.file.filename}`;
    }

    const contract = await Contract.create(contractData);
    res.status(201).json(contract);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.getContracts = async (req, res) => {
  try {
    const contracts = await Contract.find();
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateContract = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.documentPath = `/uploads/contracts/${req.file.filename}`;
    }

    const contract = await Contract.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.deleteContract = async (req, res) => {
  try {
    await Contract.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
