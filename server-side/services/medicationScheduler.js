const { format } = require('date-fns');
const Users = require('../models/Users'); // Adjust the path as per your project structure

async function checkMedicationSchedules() {
    try {
        const patients = await Users.find();

        patients.forEach(patient => {
            patient.medicines.forEach(medicine => {
                const now = new Date();

                if (medicine.nextDosageTime <= now) {
                    const alert = `Time for ${patient.name} to take ${
                      medicine.dosage
                    } ${medicine.name} at ${format(
                      medicine.nextDosageTime,
                      "hh:mm:ss a"
                    )}`;
                }
            });
        });
    } catch (error) {
        console.error('Failed to check medication schedules', error);
    }
}

module.exports = checkMedicationSchedules;
