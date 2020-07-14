import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const RequestSchema = new Schema({
  numRequests: { type: Number, default: 0 },
  topic: String,
  person1: String,
  person2: String,
  person2Email: String,
  person1Email: String,
  date: { type: Date, default: Date.now },
  requestUsers: [{ email: String, date: Date, userID: { type: Schema.Types.ObjectId, ref: 'User' } }],
  person1ID: { type: Schema.Types.ObjectId, ref: 'User' },
  person2ID: { type: Schema.Types.ObjectId, ref: 'User' }, //  apikey: String, // primitive method for keeping multiple projects separate
  status: { type: String, default: "ACCEPT_VOTES" },
});

RequestSchema.set('toJSON', {
  virtuals: true,
});

// create model class
const RequestModel = mongoose.model('RequestModel', RequestSchema);

export default RequestModel;
