import React, { useEffect, useRef, useState } from "react";

const ReactionTime = ({ getTime }: { getTime: (data: number) => void }) => {
  // Returns a random integer from 0 to 9:
  const [color, setColor] = useState("bg-red-600");
  const [message, setMessage] = useState(
    "Click when the screen turns green..."
  );
  const timeInterval = Math.floor(Math.random() * 10);
  const startTime = useRef(0);
  const measuringTime = useRef(true);

  // change the color of the screen after (random amount of time)
  // and then start measuring time, useEffect => only do it on initial render (no dependencies in array)
  useEffect(() => {
    setTimeout(() => {
      setColor("bg-green-600");
      startTime.current = new Date().getTime();
    }, timeInterval * 1000);
  }, []);

  // check time after screen has been pressed
  const clickHandler: () => void = () => {
    const end = new Date().getTime();

    if (measuringTime.current) {
      if (color === "bg-red-600") {
        setMessage("L");
        getTime(Infinity);
      } else {
        const time = end - startTime.current; // milliseconds
        setMessage("You did it in " + time + " milliseconds!");
        getTime(time);
      }
    }

    measuringTime.current = false;
  };

  return (
    <div
      id="reaction-screen min-h-screen"
      className={color + " min-h-screen flex justify-center items-center"}
      onClick={clickHandler}
    >
      <h2 onClick={clickHandler}>{message}</h2>
    </div>
  );
};

export default ReactionTime;
