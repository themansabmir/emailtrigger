import mongoose from 'mongoose';

const BusinessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a business name.'],
    trim: true,
  },
  logoUrl: {
    type: String,
    default: null,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The unique slug for the public feedback form URL, e.g., /f/[slug]
  // Using a short, unique ID for the slug.
  slug: {
    type: String,
    required: true,
    unique: true,
  },
}, { timestamps: true });

export default mongoose.models.Business || mongoose.model('Business', BusinessSchema);
