import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import fingerprintImage from "../images/fingersensor.gif";
import logo from "../images/pharmaboticsLogo.png";

export const Login = ({ loggedIn, checkFingerprint, isDoctor, name, message }) => {
  useEffect(() => {
    // Disable scrolling
    document.body.style.overflow = "hidden";

    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div>
      {loggedIn ? (
        isDoctor ? (
          <Navigate to="/doctor" />
        ) : (
          <Navigate to="/patient" />
        )
      ) : (
        <div className="w-screen flex-col gap-4 h-screen flex items-center bgColor justify-center">
          <img className="fixed bottom-10 w-52" src={logo}></img>
          <p className="fixed bottom-4 textColor text-sm">Pharmabotics™ 2024</p>
          <img className="w-1/2 h-auto -mt-32" src={fingerprintImage}></img>
          <div className="flex fixed mt-72 flex-col items-center gap-4">
            <button
              className="rounded-xl flex flex-row items-center gap-2 text-lg tracking-wide text-sm px-5 py-3 w-max logInBtn"
              onClick={checkFingerprint}
            >
              <FeatherIcon icon="log-in" size={15} /> Scan Fingerprint
            </button>
            <div className="quicksand-medium text-center">{message}</div>
          </div>
        </div>
      )}
    </div>
  );
};
