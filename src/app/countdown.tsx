// create nextjs component that takes a date and time and counts down to that time once it hits it refreshes the page
//
"use client";

import { useEffect, useState } from "react";

export default function Countdown({ date }: { date: Date }) {
//   const [timeLeft, setTimeLeft] = useState(date.getTime() - Date.now());

//   useEffect(() => {
//     const timer = setTimeout(() => setTimeLeft(date.getTime() - Date.now()), 1000);
//     return () => clearTimeout(timer);
//   }, [timeLeft]);

//   if (timeLeft <= 0) {
//     window.location.reload();
//   }

  return (
    <div>
    <h1>
      Try again tomorrow!
    </h1>
    </div>
  );
}