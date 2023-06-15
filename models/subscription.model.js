import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

mongoose.createConnection(process.env.mongooseUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
});

const Subscription = mongoose.model('Subscription', schema);

export { Subscription };
