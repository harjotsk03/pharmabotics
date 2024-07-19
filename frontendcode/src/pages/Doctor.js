import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const Doctor = ({ doctorName }) => {
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [medicineName, setMedicineName] = useState('');
    const [medicineInterval, setMedicineInterval] = useState(0);
    const [medicineDosage, setMedicineDosage] = useState(0);
    const [message, setMessage] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        getUsers(); // Fetch users initially when the component mounts
        const interval = setInterval(() => {
            getUsers(); // Setup interval to fetch users every second
        }, 1000);

        return () => clearInterval(interval); // Cleanup the interval on component unmount
    }, []);

    const enrollUser = async () => {
        try {
            const response = await axios.post('http://localhost:3001/enroll', {
                id: userId,
                name: userName,
                medicines: [{
                    name: medicineName,
                    interval: medicineInterval,
                    dosage: medicineDosage
                }]
            });
            setMessage('User enrolled successfully');
        } catch (error) {
            setMessage(error.response.data.message);
        }
    };

    const getUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/users');
            setUsers(response.data);
        } catch (error) {
            setMessage(error.response.data.message); // Display the error message from the server
        }
    };

    return (
        <div>
            <h1>Doctor Screen</h1>

            <h1>Fingerprint Enrollment and Matching</h1>
            <div>
                <label>User ID:</label>
                <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>
            <div>
                <label>User Name:</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div>
                <label>Medicine Name:</label>
                <input type="text" value={medicineName} onChange={(e) => setMedicineName(e.target.value)} />
            </div>
            <div>
                <label>Medicine Interval (hours):</label>
                <input type="number" value={medicineInterval} onChange={(e) => setMedicineInterval(e.target.value)} />
            </div>
            <div>
                <label>Medicine Dosage:</label>
                <input type="number" value={medicineDosage} onChange={(e) => setMedicineDosage(e.target.value)} />
            </div>
            <button onClick={enrollUser}>Enroll User</button>
            <div>
                <h2>Message: {message}</h2>
            </div>

            <div>
                <h2>Users:</h2>
                <ul>
                    {users
                        .filter(user => user.name !== doctorName) // Filter out the doctor from the users list
                        .map(user => (
                            <li key={user.id}>
                                {user.name} (User ID: {user.id})
                                <ul>
                                    {user.medicines.map(medicine => (
                                        <li key={medicine.name}>
                                            Medicine: {medicine.name}, Interval: {medicine.interval} hours, Dosage: {medicine.dosage}, Next Time: {medicine.nextDosageTimeFormatted}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
};
