import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const DebateLikeSchema = new Schema({
  videoTime: Number,
  debateID: { type: Schema.Types.ObjectId, ref: 'Debate' },
  videoSection: Number,
  date: { type: Date, default: Date.now },
  likerID: { type: Schema.Types.ObjectId, ref: 'User' },
});

DebateLikeSchema.set('toJSON', {
  virtuals: true,
});

// create model class
const DebateLikeModel = mongoose.model('DebateLike', DebateLikeSchema);

export default DebateLikeModel;
