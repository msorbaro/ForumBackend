import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const DebateSchema = new Schema({
  requestID: { type: Schema.Types.ObjectId, ref: 'RequestModel' },
  overallStatus: { type: String, default: 'PENDING_ACCEPTANCE' },
  person1Status: { type: String, default: 'PENDING' },
  person2Status: { type: String, default: 'PENDING' },
  person1Email: String,
  person2Email: String,
  personAcceptedFirst: { type: String, default: '' },
  firstVideoLink: { type: String, default: '' },
  secondVideoLink: { type: String, default: '' },
  thirdVideoLink: { type: String, default: '' },
  fourthVideoLink: { type: String, default: '' },
  videoViews: { type: Number, default: 0 },
});

DebateSchema.set('toJSON', {
  virtuals: true,
});

// create model class
const DebateModel = mongoose.model('Debate', DebateSchema);

export default DebateModel;
