import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const NotificationSchema = new Schema({
  debateID: { type: Schema.Types.ObjectId, ref: 'Debate' },
  date: { type: Date, default: Date.now },
  userID: { type: Schema.Types.ObjectId, ref: 'User' },
  seenByUser: { type: Boolean, default: false},
  type: String,
  message: { type: String, default: ''}, 

});

NotificationSchema.set('toJSON', {
  virtuals: true,
});

// create model class
const NotificationModel = mongoose.model('Notification', NotificationSchema);

export default NotificationModel;
