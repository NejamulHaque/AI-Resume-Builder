const mongoose = require('mongoose');

const connectDB = (cb) => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    cb();
  })
  .catch(err => {
    console.error('❌ DB Connection Error:', err);
    process.exit(1);
  });
};

module.exports = connectDB;