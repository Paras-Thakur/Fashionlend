const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  purpose: {
    type: String,
    enum: ['verification', 'password_reset'],
    default: 'verification'
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for email and purpose for quick lookups
otpSchema.index({ email: 1, purpose: 1 });

// Create TTL index to automatically delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if OTP is valid
otpSchema.methods.isValid = function() {
  return !this.isUsed && new Date() < this.expiresAt;
};

// Method to mark OTP as used
otpSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  return this.save();
};

// Static method to generate OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create OTP for email
otpSchema.statics.createOTP = async function(email, purpose = 'verification') {
  // Delete any existing unused OTPs for this email and purpose
  await this.deleteMany({ email, purpose, isUsed: false });
  
  const otp = this.generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  
  const otpDoc = new this({
    email,
    otp,
    purpose,
    expiresAt
  });
  
  await otpDoc.save();
  return otp;
};

// Static method to verify OTP
otpSchema.statics.verifyOTP = async function(email, otp, purpose = 'verification') {
  const otpDoc = await this.findOne({ 
    email: email.toLowerCase(), 
    otp, 
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!otpDoc) {
    return { valid: false, message: 'Invalid or expired OTP' };
  }
  
  // Mark OTP as used
  await otpDoc.markAsUsed();
  
  return { valid: true, message: 'OTP verified successfully' };
};

// Static method to verify OTP without marking as used (for initial verification)
otpSchema.statics.verifyOTPWithoutMarking = async function(email, otp, purpose = 'verification') {
  const otpDoc = await this.findOne({ 
    email: email.toLowerCase(), 
    otp, 
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!otpDoc) {
    return { valid: false, message: 'Invalid or expired OTP' };
  }
  
  return { valid: true, message: 'OTP verified successfully' };
};

module.exports = mongoose.model('OTP', otpSchema);
