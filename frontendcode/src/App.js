import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doctor } from './pages/Doctor';

const App = () => {
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [medicineName, setMedicineName] = useState('');
    const [medicineInterval, setMedicineInterval] = useState(0);
    const [medicineDosage, setMedicineDosage] = useState(0);
    const [message, setMessage] = useState('');
    const [users, setUsers] = useState([]);

    const [loggedIn, setLoggedIn] = useState(false);
    const [doctorName, setDoctorName] = useState('');

    useEffect(() => {
        getUsers(); // Fetch users initially when the component mounts
        const interval = setInterval(() => {
            getUsers(); // Setup interval to fetch users every second
        }, 1000);

        return () => clearInterval(interval); // Cleanup the interval on component unmount
    }, []);

    const getUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/users');
            setUsers(response.data);
        } catch (error) {
            setMessage(error.response.data.message); // Display the error message from the server
        }
    };

    const checkFingerprint = async () => {
      try {
          const response = await axios.post('http://localhost:3001/check', { id: userId });

          console.log(response.data);

          if(response.data.isDoctor){
            setLoggedIn(true);
            setDoctorName(response.data.name);
          }
          setMessage(`Fingerprint matched for user: ${response.data.name}`); // Access 'name' property from response data
      } catch (error) {
          if (error.response && error.response.status === 404) {
              setMessage('Fingerprint not matched');
          } else {
              setMessage(error.response.data.message); // Display the error message from the server
          }
      }
  };  

    return (
        <div>

          {loggedIn ? (
            <div>

              <Doctor doctorName={doctorName} />

            </div>
          ):(
            <div>

              <h2>Not a doctor</h2>

              <button onClick={checkFingerprint}>Check Fingerprint</button>

            </div>
          )}
            
        </div>
    );
};

export default App;
