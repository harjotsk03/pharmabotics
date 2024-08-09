import React, { useState } from "react";
import axios from "axios";

export const AddPatient = () => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [medicineDetails, setMedicineDetails] = useState({});
  const [message, setMessage] = useState("");

  const medicines = ["Advil", "Tylenol"];

  const handleCheckboxChange = (medicine) => {
    setSelectedMedicines((prev) =>
      prev.includes(medicine)
        ? prev.filter((item) => item !== medicine)
        : [...prev, medicine]
    );
  };

  const handleMedicineDetailChange = (medicine, field, value) => {
    setMedicineDetails((prev) => ({
      ...prev,
      [medicine]: {
        ...prev[medicine],
        [field]: value,
      },
    }));
  };

  const enrollUser = async () => {
    try {
      const response = await axios.post("http://localhost:3002/enroll", {
        id: userId,
        name: userName,
        medicines: selectedMedicines.map((medicine) => ({
          name: medicine,
          interval: medicineDetails[medicine]?.interval || 0,
          dosage: medicineDetails[medicine]?.dosage || 0,
        })),
      });
      setMessage("User enrolled successfully");
    } catch (error) {
      setMessage(error.response.data.message);
    }
  };

  return (
    <div>
      <h1 className="quicksand-bold text-2xl mb-5">
        Fingerprint Enrollment and Matching
      </h1>
      <div className="bg-white w-3/4 shadow-lg rounded-lg px-6 py-2 mb-4">
        <div className="mb-2">
          <label className="quicksand-semibold text-lg">User ID:</label>
          <input
            className="input"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="quicksand-semibold text-lg">
            Patient Full Name:
          </label>
          <input
            className="input"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="quicksand-semibold text-lg">Medicine:</label>
          <div className="flex gap-10 mt-2">
            {medicines.map((medicine) => (
              <div key={medicine}>
                <input
                  type="checkbox"
                  id={medicine}
                  checked={selectedMedicines.includes(medicine)}
                  onChange={() => handleCheckboxChange(medicine)}
                />
                <label className="ml-2" htmlFor={medicine}>
                  {medicine}
                </label>
                <div className="flex flex-col mt-2">
                  <div className="flex flex-col gap-1">
                    <label className="quicksand-semibold text-sm">
                      Interval (hours):
                    </label>
                    <input
                      className="input mb-3"
                      type="number"
                      value={medicineDetails[medicine]?.interval || ""}
                      onChange={(e) =>
                        handleMedicineDetailChange(
                          medicine,
                          "interval",
                          e.target.value
                        )
                      }
                      disabled={!selectedMedicines.includes(medicine)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="quicksand-semibold text-sm">
                      Dosage:
                    </label>
                    <input
                      className="input"
                      type="number"
                      value={medicineDetails[medicine]?.dosage || ""}
                      onChange={(e) =>
                        handleMedicineDetailChange(
                          medicine,
                          "dosage",
                          e.target.value
                        )
                      }
                      disabled={!selectedMedicines.includes(medicine)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          className="rounded-xl flex flex-row mt-8 items-center gap-2 tracking-wide text-sm px-5 py-3 w-max logInBtn"
          onClick={enrollUser}
        >
          Enroll User
        </button>
        <div className="mt-4">
          <h2 className="quicksand-medium text-lg">{message}</h2>
        </div>
      </div>
    </div>
  );
};
