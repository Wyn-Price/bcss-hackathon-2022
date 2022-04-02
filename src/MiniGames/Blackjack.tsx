import { useState } from "react";

const Blackjack = ({ getScore }: { getScore: (data: number) => void }) => {
  const [score, setScore] = useState("0");

  const buttonStyle =
    "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

  const dealAnother = () => {
    // generate random number (or pull from deck later)
    const newCard = Math.floor(Math.random() * 12);
    const newScore = parseInt(score) + newCard;

    // check if score == 21 (win), above (lose), or below (continue)
    if (newScore == 21) {
      setScore("You got 21!");
      getScore(newScore);
    } else if (newScore > 21) {
      setScore("Unlucky... you got " + newScore);
      getScore(newScore);
    } else {
      setScore(newScore.toString());
    }
  };

  const submitScore = () => {
    getScore(parseInt(score));
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="flex flex-col gap-20 items-center">
        <h1>{score}</h1>
        <div className="flex flex-row gap-20">
          <button className={buttonStyle} onClick={dealAnother}>
            Deal Another
          </button>
          <button className={buttonStyle} onClick={submitScore}>
            I'm Finished
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blackjack;
