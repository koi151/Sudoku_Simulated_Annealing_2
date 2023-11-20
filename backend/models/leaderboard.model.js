const mongoose = require('mongoose')

const leaderboardSchema = new mongoose.Schema(
{
  userName: String,
  timeSolved: Number,
  solvedBoard: {
    type: Array,
    default: []
  },
  gameMode: String,
  createAt: Date,
  deleted: {
    type: Boolean,
    default: false
  }
})
// { timestamps: true })

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema, 'leaderboard');

module.exports = Leaderboard;