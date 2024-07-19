const mongoose = require('mongoose');
const { format } = require('date-fns');

const usersSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  isDoctor: {
    type: Boolean,
    default: false
  },
  medicines: [{
    name: {
      type: String,
      required: true
    },
    interval: {
      type: Number,
      required: true
    },
    dosage: {
      type: Number,
      required: true
    },
    nextDosageTime: {
      type: Date
    },
    nextDosageTimeFormatted: {
      type: String
    }
  }]
});

usersSchema.pre('save', function(next) {
    const now = new Date();
    this.medicines.forEach(medicine => {
      if (!medicine.nextDosageTime) {
        const nextDosage = new Date(now.getTime() + medicine.interval * 60 * 60 * 1000);
        medicine.nextDosageTime = nextDosage;
        medicine.nextDosageTimeFormatted = format(nextDosage, 'hh:mm:ss a');
        console.log(`Set nextDosageTime for ${medicine.name} to ${medicine.nextDosageTimeFormatted}`);
      }
    });
    next();
});

module.exports = mongoose.model('User', usersSchema);
