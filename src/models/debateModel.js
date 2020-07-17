import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const DebateSchema = new Schema({
  requestID: { type: Schema.Types.ObjectId, ref: 'RequestModel' },
  overallStatus: { type: String, default: 'PENDING_ACCEPTANCE' },
  person1Status: { type: String, default: 'PENDING' },
  person2Status: { type: String, default: 'PENDING' },
  person1Email: String,
  person2Email: String,
  person1ID: { type: Schema.Types.ObjectId, ref: 'User' },
  person2ID: { type: Schema.Types.ObjectId, ref: 'User' },
  personAcceptedFirst: { type: String, default: '' },
  firstVideoLink: { type: String, default: '' },
  secondVideoLink: { type: String, default: '' },
  thirdVideoLink: { type: String, default: '' },
  fourthVideoLink: { type: String, default: '' },
  firstVideoLength: { type: Number, default: 0 },
  secondVideoLength: { type: Number, default: 0 },
  thirdVideoLength: { type: Number, default: 0 },
  fourthVideoLength: { type: Number, default: 0 },
  videoViews: { type: Number, default: 0 },
  totalVideoLikes: { type: Number, default: 0 },
  videoLikes: [{
    email: String,
    date: Date,
    section: Number,
    time: Number,
  }],
});

DebateSchema.set('toJSON', {
  virtuals: true,
});

// create model class
const DebateModel = mongoose.model('Debate', DebateSchema);

export default DebateModel;
