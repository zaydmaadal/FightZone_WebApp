import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  // Type van event: 'vkbmo', 'training', 'club'
  type: {
    type: String,
    enum: ['vkbmo', 'training', 'club'],
    required: true,
  },
  // Voor club events: welke club het betreft
  club: {
    type: String,
  },
  // Voor training events: welke trainer het betreft
  trainer: {
    type: String,
  },
  // Voor wie het event zichtbaar is
  visibility: {
    type: String,
    enum: ['public', 'club', 'trainer'],
    default: 'public',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt timestamp before saving
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Event || mongoose.model('Event', eventSchema); 