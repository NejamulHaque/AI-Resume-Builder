const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: String,
  email: String,
  phone: String,
  linkedin: String,
  summary: String,
  education: [{
    institution: String,
    degree: String,
    field: String,
    year: String
  }],
  experience: [{
    jobTitle: String,
    company: String,
    start: String,
    end: String,
    responsibilities: String
  }],
  skills: [String],
  projects: [{
    name: String,
    url: String,
    description: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', ResumeSchema);