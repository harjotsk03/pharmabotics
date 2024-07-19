import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Doctor } from './pages/Doctor';
import { NewPatient } from './pages/NewPatient';
import NavBar from './components/NavBar';
import './App.css';

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
            setMessage(error.response?.data?.message || 'Error fetching users'); // Display the error message from the server
        }
    };

    const checkFingerprint = async () => {
        try {
            const response = await axios.post('http://localhost:3001/check', { id: userId });

            console.log(response.data);

            if (response.data.isDoctor) {
                setLoggedIn(true);
                setDoctorName(response.data.name);
            }
            setMessage(`Fingerprint matched for user: ${response.data.name}`); // Access 'name' property from response data
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setMessage('Fingerprint not matched');
            } else {
                setMessage(error.response?.data?.message || 'Error checking fingerprint'); // Display the error message from the server
            }
        }
    };

    const handleLogout = () => {
        setLoggedIn(false);
        setDoctorName('');
        setMessage('Logged out successfully');
    };

    return (
        <Router>
            {loggedIn && <NavBar onLogout={handleLogout} doctorName={doctorName}/>} {/* Pass the log-out function to NavBar */}
            <Routes>
                <Route path="/" element={<Home loggedIn={loggedIn} checkFingerprint={checkFingerprint} />} />
                <Route path="/doctor" element={<PrivateRoute loggedIn={loggedIn}><Doctor doctorName={doctorName} /></PrivateRoute>} />
                <Route path="/newPatient" element={<PrivateRoute loggedIn={loggedIn}><NewPatient /></PrivateRoute>} />
            </Routes>
        </Router>
    );
};

const Home = ({ loggedIn, checkFingerprint }) => {
    return (
        <div>
            {loggedIn ? (
                <Navigate to="/doctor" />
            ) : (
                <div>
                    <h2>Not a doctor</h2>
                    <button onClick={checkFingerprint}>Check Fingerprint</button>
                </div>
            )}
        </div>
    );
};

const PrivateRoute = ({ loggedIn, children }) => {
    const location = useLocation();
    return loggedIn ? (
        children
    ) : (
        <Navigate to="/" state={{ from: location }} />
    );
};

export default App;
