import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mood: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    sleep_hours: {
      type: Number,
      required: true,
      default: 0,
    },
    anxiety_level: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    distress_level: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.user_id = ret.userId ? ret.userId.toString() : '';
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

checkInSchema.index({ created_at: -1 });

const CheckIn = mongoose.model('CheckIn', checkInSchema);
export default CheckIn;
