const RockPaperScissors = ({
  makeChoice,
}: {
  makeChoice: (data: string) => void;
}) => {
  // use callback
  const choiceMade = (e: React.MouseEvent<HTMLElement>) => {
    const id = e.currentTarget.id;
    makeChoice(id);
  };

  const buttonStyle =
    "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

  return (
    <div className="flex justify-evenly items-center min-h-screen">
      <button id="rock" className={buttonStyle} onClick={choiceMade}>
        Rock
      </button>
      <button id="paper" className={buttonStyle} onClick={choiceMade}>
        Paper
      </button>
      <button id="scissors" className={buttonStyle} onClick={choiceMade}>
        Scissors
      </button>
    </div>
  );
};

export default RockPaperScissors;
