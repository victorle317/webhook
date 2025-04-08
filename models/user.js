const mongoose = require('mongoose');

const errorSchema = new mongoose.Schema({
  error: String,
  message: String,
}, { timestamps: true })

const jobSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  mess_id: {
    type: String,
    required: true,
  },
  job_queue_id: {
    type: String,
  },
  origin_img: {
    type: String,
    required: true,
  },
  prompt: String,
  ai_img: String,
  ai_face_img: String,
  final_img: String,
  current_step: String,
  isDone: {
    type: Boolean,
    default: false,
  },
  // số lần thử lại, chatfuel
  retries: {
    type: Number,
    default: 0,
  },
  error: [errorSchema],
}, {
  timestamps: true
});

jobSchema.index({ mess_id: 1, isDone: -1, job_queue_id: -1 });
jobSchema.index({ mess_id: -1, isDone: -1, job_queue_id: -1 });
jobSchema.index({ _id: 1, isDone: -1, job_queue_id: -1 });
jobSchema.index({ _id: -1, isDone: -1, job_queue_id: -1 });
jobSchema.index({ isDone: 1, updatedAt: -1, job_queue_id: -1 });
jobSchema.index({ isDone: 1, updatedAt: 1, job_queue_id: -1 });



const userSchema = new mongoose.Schema({
  mess_id: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  profile_pic_url: {
    type: String,
  },
  jobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  }],
  // Số lượt chơi tối đa
  limit: {
    type: Number,
    default: process.env.MAX_PLAYER_TURNS,
  },
  // Số lượt chơi ĐÃ CHƠI không tính lỗi
  try_number: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });


userSchema.index({ mess_id: 1 });
userSchema.index({ mess_id: -1 });



// Create a model using the schema
const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);

module.exports = { User, Job };
