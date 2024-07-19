import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const Doctor = ({ doctorName }) => {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');

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

    return (
        <div className='w-4/5 ml-auto pl-10 pt-8 h-screen bg-gray-100'>
            <h1 className='text-3xl mb-4'>Patients</h1>

            <div>
                <h2 className='text-red-500'>{message}</h2>
            </div>

            <div className='space-y-4'>
                {users
                    .filter(user => user.name !== doctorName)
                    .map(user => (
                        <div className='bg-white w-11/12 shadow-lg rounded-lg p-6 mb-4' key={user.id}>
                            <h1 className='text-lg font-semibold capitalize'>Name: {user.name}</h1>
                            <ul className='mt-4 space-y-2'>
                                {user.medicines.map(medicine => (
                                    <li key={medicine.name} className='border-t pt-2'>
                                        <h2 className='text-md font-medium capitalize'>Medicine: {medicine.name}</h2>
                                        <h4>Interval: {medicine.interval} hours</h4>
                                        <h4>Dosage: {medicine.dosage}</h4>
                                        <h4>Next Time: {medicine.nextDosageTimeFormatted}</h4>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
            </div>
        </div>
    );
};
