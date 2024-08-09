import "../App.css";
import React from "react";
import { NavLink } from "react-router-dom";
import profilephoto from "../images/defaultProfile.jpg";
import FeatherIcon from "feather-icons-react";

const NavBar = ({ onLogout, doctorName }) => {
  return (
    <nav className="w-1/5 bg-white border px-10 py-10 h-screen fixed flex flex-col justify-between">
      <ul className="flex flex-col gap-10">
        <li>
          <NavLink
            className="rounded-xl quicksand-semibold flex flex-row items-center gap-2 text-sm px-5 py-3 w-full block navButton"
            to="/doctor"
            activeClassName="active"
          >
            <FeatherIcon icon="users" size={15} /> Patients
          </NavLink>
        </li>
        <li>
          <NavLink
            className="rounded-xl flex flex-row quicksand-semibold items-center gap-2 text-sm px-5 py-3 w-full block navButton"
            to="/newPatient"
            activeClassName="active"
          >
            <FeatherIcon icon="user-plus" size={15} /> Add Patient
          </NavLink>
        </li>
        <div className="w-full line bg-opacity-20 rounded-full bg-black -mb-2 -mt-2"></div>
        <li>
          <button
            className="rounded-xl flex flex-row quicksand-semibold items-center gap-2 text-sm px-5 py-3 w-full text-left navButton"
            onClick={onLogout}
          >
            <FeatherIcon icon="log-out" size={15} /> Log Out
          </button>
        </li>
      </ul>

      <div className="flex flex-row items-center gap-2 borderFull rounded-xl px-5 py-3">
        <img className="w-6 rounded-full" src={profilephoto}></img>
        <h1 className="text-sm capitalize">{doctorName}</h1>
      </div>
    </nav>
  );
};

export default NavBar;
