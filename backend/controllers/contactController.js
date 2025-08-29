const ContactMessage = require('../models/ContactMessage');

exports.handleContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).send('All fields are required.');
    }

    const savedMessage = await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({ message: 'Message sent successfully!', savedMessage });
  } catch (err) {
    console.error('Error saving contact message:', err);
    res.status(500).send('Server error. Please try again.');
  }
};