import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['phq9', 'gad7', 'pcl5'],
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    severity: {
      type: String,
      required: true,
    },
    answers: {
      type: [Number],
      default: [],
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

assessmentSchema.index({ created_at: -1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
