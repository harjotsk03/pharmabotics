import React, { useEffect, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import axios from "axios";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  const calculateTimeRemaining = (targetTime) => {
    const now = new Date().getTime();
    const target = new Date(targetTime).getTime();
    const distance = target - now;

    if (distance <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  const getUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3002/users");
      const currentTime = new Date().getTime();
      const newAlerts = [];

      for (let i = 0; i < response.data.length; i++) {
        for (let j = 0; j < response.data[i].medicines.length; j++) {
          const nextDosageTime = new Date(
            response.data[i].medicines[j].nextDosageTime
          ).getTime();
          const timeRemaining = nextDosageTime - currentTime;

          if (timeRemaining <= 0) {
            newAlerts.push({
              userId: response.data[i]._id,
              name: response.data[i].name,
              medicine: response.data[i].medicines[j],
              nextDosageTime,
              nextDosageTimeFormatted:
                response.data[i].medicines[j].nextDosageTimeFormatted, // Added formatted time here
            });
          }
        }
      }

      newAlerts.sort((a, b) => a.nextDosageTime - b.nextDosageTime);

      setAlerts(newAlerts);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getUsers();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed flex z-50 overflow-scroll h-screen pb-10 flex-col w-52 gap-3 right-1 top-3">
      {alerts.length === 0 ? (
        <p>No alerts at the moment.</p>
      ) : (
        alerts.map((alert, index) => (
          <div
            key={index}
            className="bg-yellow-500 w-48 p-2 rounded-md flex flex-row gap-2 items-center"
          >
            <div>
              <p className="text-xs flex flex-row items-center gap-1">
                <div>
                  <FiAlertCircle size={15} />
                </div>
                {alert.nextDosageTimeFormatted}
              </p>
              <h3 className="text-md capitalize">
                <span className="text-xs">Patient:</span> {alert.name}
              </h3>
              <p className="text-md">
                <span className="text-xs">Medicine:</span> {alert.medicine.name}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Alerts;
