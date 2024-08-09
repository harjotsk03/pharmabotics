import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Doctor } from './pages/Doctor';
import { NewPatient } from './pages/NewPatient';
import { Patient } from "./pages/Patient";
import { Login } from "./pages/LogIn";
import NavBar from "./components/NavBar";
import "./App.css";
import Alerts from "./components/Alert";

const App = () => {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [medicineInterval, setMedicineInterval] = useState(0);
  const [medicineDosage, setMedicineDosage] = useState(0);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [patient, setPatient] = useState("");

  const [loggedIn, setLoggedIn] = useState(true);
  const [isDoctor, setIsDoctor] = useState(true);
  const [doctorName, setDoctorName] = useState("");

  useEffect(() => {
    getUsers(); // Fetch users initially when the component mounts
    const interval = setInterval(() => {
      getUsers(); // Setup interval to fetch users every second
    }, 1000);

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, []);

  const getUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3002/users");
      setUsers(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error fetching users"); // Display the error message from the server
    }
  };

  const checkFingerprint = async () => {
    try {
      const response = await axios.post("http://localhost:3002/check", {
        id: userId,
      });

      console.log(response.data);

      if (response.data.isDoctor) {
        setLoggedIn(true);
        setIsDoctor(true);
        setDoctorName(response.data.name);
      } else {
        setLoggedIn(true);
        setIsDoctor(false);
        setName(response.data.name);
        setPatient(response.data);
      }
      setMessage(`Fingerprint matched for user: ${response.data.name}`); // Access 'name' property from response data
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessage(
          "No fingerprint match found. You are either not a registered patient, or please try to scan again."
        );
      } else {
        setMessage(
          error.response?.data?.message || "Error checking fingerprint"
        ); // Display the error message from the server
      }
    }
  };

  const handleLogout = async () => {
    setLoggedIn(false);
    setIsDoctor(false);
    setDoctorName("");
    try {
      await axios.post("http://localhost:3002/logout");
      setMessage("Logged out successfully");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Router>
      {loggedIn && isDoctor && (
        <NavBar onLogout={handleLogout} doctorName={doctorName} />
      )}
      <div className="z-50">
        <Alerts />
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <Login
              loggedIn={loggedIn}
              message={message}
              checkFingerprint={checkFingerprint}
              isDoctor={isDoctor}
              name={name}
            />
          }
        />
        <Route
          path="/doctor"
          element={
            <PrivateRoute loggedIn={loggedIn} redirectTo="/">
              <Doctor doctorName={doctorName} />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient"
          element={
            <PrivateRoute loggedIn={loggedIn} redirectTo="/">
              <Patient onLogout={handleLogout} patient={patient} />
            </PrivateRoute>
          }
        />
        <Route
          path="/newPatient"
          element={
            <PrivateRoute loggedIn={loggedIn} redirectTo="/">
              <NewPatient />
            </PrivateRoute>
          }
        />
        <Route
          path="*"
          element={
            loggedIn ? (
              isDoctor ? (
                <Navigate to="/doctor" />
              ) : (
                <Navigate to="/patient" />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

const PrivateRoute = ({ loggedIn, children, redirectTo }) => {
  const location = useLocation();
  return loggedIn ? (
    children
  ) : (
    <Navigate to={redirectTo} state={{ from: location }} />
  );
};

export default App;
