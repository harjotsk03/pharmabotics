require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { SerialPort, ReadlineParser } = require('serialport');
const cors = require('cors');
const mongoose = require('mongoose');
const Users = require('./models/Users');
const checkMedicationSchedules = require('./services/medicationScheduler');
const axios = require("axios");
const { format } = require("date-fns");

const app = express();
app.use(bodyParser.json());
app.use(cors());
const PORT = process.env.PORT || 3002;

const uri = process.env.MONGODB_URI;

// connect to MongoDB
mongoose
  .connect(uri, {})
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// just a test random function
app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// connect to arduino through serialport
const port = new SerialPort({
  path: "/dev/tty.usbserial-10",
  baudRate: 9600,
});
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
port.on("open", () => {
  console.log("Serial Port Opened");
});

// function for enrolling a user
app.post("/enroll", async (req, res) => {
  // get info from front end
  const { id, name, medicines } = req.body;

  try {
    // check to see if exists by ID
    const existingUser = await Users.findOne({ id });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with the same ID already exists" });
    }

    const newPatient = new Users({ id, name, medicines });
    await newPatient.save();

    console.log(`Enrolling user with ID: ${id} and Name: ${name}`);

    // after we create the user in Mongo we send a signal to arduino to begin the enrollment on the finger print sensor
    port.write("enroll\n");
    port.write(`${id}\n`);

    const timeout = setTimeout(() => {
      res.status(500).send("Enrollment failed: No response from Arduino");
    }, 1000);

    parser.once("data", function handler(data) {
      console.log(`Received from Arduino: ${data}`);
      if (data.trim() === "enrollment complete") {
        clearTimeout(timeout);
        res.status(200).json("User enrolled successfully");
        parser.off("data", handler);
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// an end point for getting all users from the DB to use on the client side
app.get("/users", async (req, res) => {
  try {
    const patients = await Users.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// function for checking to see if the user is a registered patient
app.post("/check", (req, res) => {
  port.write("check\n");

  const timeout = setTimeout(() => {
    res.status(500).send("Check failed: No response from Arduino");
  }, 10000);

  const handler = async (data) => {
    console.log(`Received from Arduino: ${data}`);
    if (data.includes("Found ID #")) {
      clearTimeout(timeout);
      const id = data.split("#")[1].split(" ")[0];

      try {
        const matchedUser = await Users.findOne({ id });
        if (matchedUser) {
          const now = new Date();
          const requiresMedication = matchedUser.medicines.some(
            (medicine) => new Date(medicine.nextDosageTime) <= now
          );
          if (requiresMedication && !matchedUser.isDoctor) {
            matchedUser.medicines.forEach((medicine) => {
              if (medicine.name == "Advil") {
                port.write(`allowMotionAdvil`);
              } else if (medicine.name == "Tylenol") {
                port.write(`allowMotionTylenol`);
              }
            });

            // if the arduino senses motion it will reset the next time for taking the medicine in the database
            const objectDetectionHandler = async (data) => {
              if (data.trim() === "objectDetected") {
                console.log(matchedUser);
                for (const medicine of matchedUser.medicines) {
                  if (new Date(medicine.nextDosageTime) <= now) {
                    try {
                      await axios.put(
                        `http://localhost:3002/users/${id}/medicines/${medicine._id}`,
                        {
                          interval: medicine.interval,
                        }
                      );
                      console.log(
                        `Updated dosage time for medicine ${medicine.name}`
                      );
                    } catch (error) {
                      console.error(
                        `Error updating dosage time for medicine ${medicine.name}:`,
                        error.message
                      );
                    }
                  }
                }
              }
            };

            parser.on("data", objectDetectionHandler);
          } else {
            port.write("lightoff\n");
          }

          console.log(matchedUser.name);
          res.status(200).json(matchedUser);
        } else {
          res
            .status(200)
            .json({ message: "Fingerprint matched, but user not found" });
        }
      } catch (error) {
        console.error("Error searching for user:", error);
        res.status(500).json({ message: "Server error" });
      }

      parser.off("data", handler);
    } else if (data.trim() === "Fingerprint not found") {
      clearTimeout(timeout);
      res.status(404).send("Fingerprint not matched");
      parser.off("data", handler);
    }
  };

  parser.on("data", handler);
});

// just an end point for updating the users information (this never got used or implimented...yet)
app.put("/users/:id/medicines/:medicineId", async (req, res) => {
  const { id, medicineId } = req.params;
  const { interval } = req.body;

  try {
    const now = new Date();
    const nextDosage = new Date(now.getTime() + interval * 60 * 60 * 1000);
    const nextDosageTimeFormatted = format(nextDosage, "hh:mm:ss a");

    console.log(`Updating medicine ${medicineId} for user ${id}`);

    const updatedUser = await Users.findOneAndUpdate(
      { id, "medicines._id": medicineId },
      {
        $set: {
          "medicines.$.nextDosageTime": nextDosage,
          "medicines.$.nextDosageTimeFormatted": nextDosageTimeFormatted,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log(
        `User or medicine not found: User ID ${id}, Medicine ID ${medicineId}`
      );
      return res.status(404).json({ message: "User or medicine not found" });
    }

    console.log(`Successfully updated user: ${updatedUser}`);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating medicine:", error);
    res.status(500).json({ message: error.message });
  }
});

app.put("/users/:id/medicines/:medicineId", async (req, res) => {
  const { id, medicineId } = req.params;
  const { interval } = req.body;

  try {
    const now = new Date();
    const nextDosage = new Date(now.getTime() + interval * 60 * 60 * 1000);
    const nextDosageTimeFormatted = format(nextDosage, "hh:mm:ss a");

    console.log(`Updating medicine ${medicineId} for user ${id}`);

    const updatedUser = await Users.findOneAndUpdate(
      { id, "medicines._id": medicineId },
      {
        $set: {
          "medicines.$.nextDosageTime": nextDosage,
          "medicines.$.nextDosageTimeFormatted": nextDosageTimeFormatted,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log(
        `User or medicine not found: User ID ${id}, Medicine ID ${medicineId}`
      );
      return res.status(404).json({ message: "User or medicine not found" });
    }

    console.log(`Successfully updated user: ${updatedUser}`);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating medicine:", error);
    res.status(500).json({ message: error.message });
  }
});

app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { medicines } = req.body;

  try {
    const updatedUser = await Users.findOneAndUpdate(
      { id },
      { medicines },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// every second we check to see if patients need to take medication
setInterval(() => {
  checkMedicationSchedules();
}, 1000);

// open the port and run the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

