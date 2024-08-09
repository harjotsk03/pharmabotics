import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CountdownTimer } from "../components/CountdownTimer";
import Alerts from "../components/Alert";
import FeatherIcon from "feather-icons-react";

export const Doctor = ({ doctorName }) => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    getUsers(); // Fetch users initially when the component mounts
    const interval = setInterval(() => {
      getUsers(); // Setup interval to fetch users every second
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3002/users");
      const filteredUsers = response.data.filter((user) => !user.isDoctor); // Filter out users with isDoctor as true
      setUsers(filteredUsers);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error fetching users");
    }
  };

  const handleEditClick = (user) => {
    if (editingUserId === user.id) {
      // If the same user is clicked again, cancel editing
      setEditingUserId(null);
      setEditFormData({});
    } else {
      // Start editing the clicked user
      setEditingUserId(user.id);
      setEditFormData({
        medicines: user.medicines.reduce((acc, medicine) => {
          acc[medicine.name] = {
            interval: medicine.interval,
            dosage: medicine.dosage,
            name: medicine.name,
          };
          return acc;
        }, {}),
      });
    }
  };

  const handleEditChange = (medicineName, field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      medicines: {
        ...prev.medicines,
        [medicineName]: {
          ...prev.medicines[medicineName],
          [field]: value,
        },
      },
    }));
  };

  const handleCheckboxChange = (medicineName) => {
    setEditFormData((prev) => ({
      ...prev,
      medicines: {
        ...prev.medicines,
        [medicineName]: prev.medicines[medicineName]
          ? undefined
          : { interval: "", dosage: "", name: medicineName },
      },
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const updatedMedicines = Object.values(editFormData.medicines).filter(
        Boolean
      );
      await axios.put(`http://localhost:3002/users/${editingUserId}`, {
        medicines: updatedMedicines,
      });
      setEditingUserId(null);
      setEditFormData({});
      getUsers();
      setMessage("User updated successfully");
    } catch (error) {
      setMessage(error.response.data.message);
    }
  };

  return (
    <div className="w-4/5 ml-auto pl-10 bg-gray-100 pt-8">
      <div>
        <h2 className="text-red-500">{message}</h2>
      </div>

      <div className="space-y-4 pt-2 pb-20">
        {users
          .filter((user) => user.name !== doctorName)
          .map((user) => (
            <div
              className="bg-white w-3/4 shadow-lg rounded-lg p-6 mb-4"
              key={user.id}
            >
              <div className="flex flex-row justify-between">
                <h1 className="text-lg quicksand-bold capitalize">
                  {user.name} (ID: {user.id})
                </h1>
                {/* <button onClick={() => handleEditClick(user)} className="mr-1">
                  <FeatherIcon icon="edit" size={18} />
                </button> */}
              </div>

              {editingUserId === user.id ? (
                <h1></h1>
              ) : (
                <ul className="mt-4 space-y-2">
                  {user.medicines.map((medicine) => (
                    <li key={medicine.name} className="border-t pt-2">
                      <h2 className="text-md quicksand-medium capitalize">
                        Medicine:{" "}
                        <span className="quicksand-bold"> {medicine.name}</span>
                      </h2>
                      <h4>
                        Interval:{" "}
                        <span className="quicksand-bold">
                          {medicine.interval} hours
                        </span>
                      </h4>
                      <h4 className="text-md">
                        Next Dosage Time:{" "}
                        <span className="quicksand-bold">
                          {medicine.nextDosageTimeFormatted}
                        </span>
                      </h4>
                      <CountdownTimer targetTime={medicine.nextDosageTime} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
