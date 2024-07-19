require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { SerialPort, ReadlineParser } = require('serialport');
const cors = require('cors');
const mongoose = require('mongoose');
const Users = require('./models/Users');
const checkMedicationSchedules = require('./services/medicationScheduler');

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
      console.log('Connected to MongoDB');
  })
  .catch((err) => {
      console.error('Failed to connect to MongoDB', err);
  });

app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});

const port = new SerialPort({
    path: '/dev/tty.usbserial-10',
    baudRate: 9600
});
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.on('open', () => {
    console.log('Serial Port Opened');
});

app.post('/enroll', async (req, res) => {
    const { id, name, medicines } = req.body;

    try {
        const existingUser = await Users.findOne({ id });

        if (existingUser) {
            return res.status(400).json({ message: 'User with the same ID already exists' });
        }

        const newPatient = new Users({ id, name, medicines });
        await newPatient.save();

        console.log(`Enrolling user with ID: ${id} and Name: ${name}`);

        port.write('enroll\n');
        console.log(`${id}`);
        port.write(`${id}\n`);

        const timeout = setTimeout(() => {
            res.status(500).send('Enrollment failed: No response from Arduino');
        }, 1000);

        parser.once('data', function handler(data) {
            console.log(`Received from Arduino: ${data}`);
            if (data.trim() === 'enrollment complete') {
                clearTimeout(timeout);
                res.status(200).json('User enrolled successfully');
                parser.off('data', handler);
            }
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/users', async (req, res) => {
    try {
        const patients = await Users.find();
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/check', (req, res) => {
    port.write('check\n'); // Send check command to Arduino

    const timeout = setTimeout(() => {
        res.status(500).send('Check failed: No response from Arduino');
    }, 10000);

    const handler = async (data) => {
        console.log(`Received from Arduino: ${data}`);
        if (data.includes('Found ID #')) {
            clearTimeout(timeout);
            const id = data.split('#')[1].split(' ')[0];

            try {
                const matchedUser = await Users.findOne({ id });
                if (matchedUser) {
                    const now = new Date();
                    const requiresMedication = matchedUser.medicines.some(medicine => new Date(medicine.nextDosageTime) <= now);
                    if (requiresMedication) {
                        port.write('allowMotion\n'); // Allow motion
                        console.log('allowing motion');
                    } else {
                        port.write('lightoff\n');
                    }

                    console.log(matchedUser.name);
                    res.status(200).json(matchedUser);
                } else {
                    res.status(200).json({ message: 'Fingerprint matched, but user not found' });
                }
            } catch (error) {
                console.error('Error searching for user:', error);
                res.status(500).json({ message: 'Server error' });
            }

            parser.off('data', handler);
        } else if (data.trim() === 'Fingerprint not found') {
            clearTimeout(timeout);
            res.status(404).send('Fingerprint not matched');
            parser.off('data', handler);
        }
    };

    parser.on('data', handler);
});

setInterval(() => {
    checkMedicationSchedules();
}, 1000);

app.listen(3001, () => {
    console.log('Server running on port 3001');
});
