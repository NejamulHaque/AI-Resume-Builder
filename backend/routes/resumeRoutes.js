const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const Resume = require('../models/Resume');

// POST /api/resume/save
router.post('/save', verifyToken, async (req, res) => {
  try {
    req.body.userId = req.user.userId;
    const resume = await Resume.create(req.body);
    res.status(201).json({ 
      success: true,
      message: 'Resume saved!', 
      resume 
    });
  } catch (error) {
    console.error('Save Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/resume/my-resumes
router.get('/my-resumes', verifyToken, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.userId })
                              .sort({ createdAt: -1 });
    res.json({ 
      success: true,
      resumes 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to load resumes',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// DELETE /api/resume/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Resume.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true,
      message: 'Resume deleted' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Delete failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;