import React, { useEffect, useState } from "react";

export const CountdownTimer = ({ targetTime }) => {
  const [remainingTime, setRemainingTime] = useState(
    calculateTimeRemaining(targetTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(calculateTimeRemaining(targetTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  function calculateTimeRemaining(targetTime) {
    const now = new Date().getTime();
    const target = new Date(targetTime).getTime();
    const distance = target - now;

    if (distance <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  }

  return (
    <div className="quicksand-medium text-md">
      Time Left:{" "}
      <span className="quicksand-bold text-lg">
        {remainingTime.hours}h {remainingTime.minutes}m {remainingTime.seconds}s
      </span>
    </div>
  );
};
