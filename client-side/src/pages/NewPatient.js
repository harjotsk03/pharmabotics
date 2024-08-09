import { AddPatient } from "../components/AddPatient";
import React, { useEffect } from "react";

export const NewPatient = ({ doctorName }) => {
  useEffect(() => {
    // Disable scrolling
    document.body.style.overflow = "hidden";

    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="w-4/5 ml-auto overflow-hidden pl-10 pt-8 h-screen bg-gray-100">
      <div>
        <AddPatient />
      </div>
    </div>
  );
};
