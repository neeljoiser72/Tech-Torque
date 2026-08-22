import mongoose from 'mongoose';

const riskPredictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    risk_level: {
      type: String,
      enum: ['low', 'moderate', 'high', 'severe'],
      required: true,
    },
    risk_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    factors: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      required: true,
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

riskPredictionSchema.index({ created_at: -1 });

const RiskPrediction = mongoose.model('RiskPrediction', riskPredictionSchema);
export default RiskPrediction;
