import FeatherIcon from "feather-icons-react";

export const Patient = ({ patient, onLogout }) => {
  return (
    <div className="flex h-screen justify-center items-center">
      <div className="fixed top-4 left-4">
        <button
          className="rounded-xl flex flex-row items-center gap-2 text-lg tracking-wide text-xs px-5 py-3 w-max logInBtn"
          onClick={onLogout}
        >
          <FeatherIcon icon="log-out" size={15} /> Log Out
        </button>
      </div>
      {patient ? (
        <div
          className="bg-white w-1/3 shadow-xl rounded-lg p-6 mb-4"
          key={patient.id}
        >
          <h1 className="text-lg font-semibold capitalize">
            Patient: {patient.name}
          </h1>
          <ul className="mt-4 space-y-2">
            {patient.medicines?.map((medicine) => (
              <li key={medicine.name} className="border-t pt-2">
                <h2 className="text-md font-medium capitalize">
                  Medicine: {medicine.name}
                </h2>
                <h4>Interval: {medicine.interval} hours</h4>
                <h4>Dosage: {medicine.dosage}</h4>
                <h4>Next Time: {medicine.nextDosageTimeFormatted}</h4>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          className="bg-white w-1/3 shadow-xl rounded-lg p-6 mb-4"
          key={patient.id}
        >
          <h1 className="text-lg quicksand-bold capitalize">
            Patient: Harjot Singh
          </h1>
          <h2 className="text-md quicksand-medium capitalize">
            Medicine: Advil
          </h2>
          <h2 className="text-md quicksand-medium capitalize">
            Interval: 1 hour
          </h2>
          <h2 className="text-md quicksand-medium capitalize">Dosage: 1</h2>
          <h2 className="text-md quicksand-medium capitalize">
            Next Time: 3:23:09 PM
          </h2>
        </div>
      )}
    </div>
  );
};
