import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema({
  user_id: { type: String },
  meetingCode: { type: String, required: true },
  date: { type: Date, default: Date.Now, required: true },
});

const Meeting = mongoose.model("Meeting", meetingSchema);

// Jab Default ka use krte h to ek hi chiz import kar pate h  or aise m hmm bin adefault k bhut sari chize user kar paaenge
export { Meeting };
