import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const RequestSchema = new Schema({
  numRequests: { type: Number, default: 0 },
  topic: String,
  person1: String,
  person2: String,
  date: { type: Date, default: Date.now },
  requestUsers: [{ email: String, date: Date }],
  //  apikey: String, // primitive method for keeping multiple projects separate
});

RequestSchema.set('toJSON', {
  virtuals: true,
});

// create model class
const RequestModel = mongoose.model('RequestModel', RequestSchema);

export default RequestModel;
