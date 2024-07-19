import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const AddPatient = () => {
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [medicineName, setMedicineName] = useState('');
    const [medicineInterval, setMedicineInterval] = useState(0);
    const [medicineDosage, setMedicineDosage] = useState(0);
    const [message, setMessage] = useState('');

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

    return(
        <div>
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
        </div>
    )
}