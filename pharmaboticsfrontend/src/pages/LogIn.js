import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const LogIn = () => {
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState('');

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
            setMessage(`Fingerprint matched for user: ${response.data.name}`); // Access 'name' property from response data
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setMessage('Fingerprint not matched');
            } else {
                setMessage(error.response.data.message); // Display the error message from the server
            }
        }
    };

    return(
        <div>
            <h1>Log In Screen</h1>
        </div>
    )
}