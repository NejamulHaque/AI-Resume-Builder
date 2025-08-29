const express = require('express');
const router = express.Router();
const { handleContactForm } = require('../controllers/contactController');
const ContactMessage = require('../models/ContactMessage');

router.post('/', handleContactForm);

module.exports = router;
// DELETE a message
router.delete('/:id', async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.send('Message deleted');
  } catch (err) {
    res.status(500).send('Delete failed');
  }
});

// PATCH archive a message
router.patch('/:id/archive', async (req, res) => {
  try {
    await ContactMessage.findByIdAndUpdate(req.params.id, { archived: true });
    res.send('Message archived');
  } catch (err) {
    res.status(500).send('Archive failed');
  }
});
router.get('/', async (req, res) => {
  try {
    const isArchived = req.query.archived === 'true';
    const messages = await ContactMessage.find({ archived: isArchived }).sort({ submittedAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).send('Failed to load messages');
  }
});