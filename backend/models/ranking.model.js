const mongoose = require('mongoose')

const rankingSchema = new mongoose.Schema(
{
  userName: String,
  timeSolved: Number,
  solvedBoard: {
    type: Array,
    default: []
  },
  createAt: Date
})
// { timestamps: true })

const Ranking = mongoose.model("Ranking", rankingSchema, 'ranking');

module.exports = Ranking;