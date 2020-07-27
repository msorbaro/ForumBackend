import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const TopicSchema = new Schema({
  topic: String,
  dateLastRequested: { type: Date, default: Date.now },
});

TopicSchema.set('toJSON', {
  virtuals: true,
});

// create model class
const TopicModel = mongoose.model('Topic', TopicSchema);

export default TopicModel;
