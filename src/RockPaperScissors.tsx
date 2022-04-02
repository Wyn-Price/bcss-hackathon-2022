const RockPaperScissors = (props: (button: String) => void) => {
  const choiceMade = (e: React.MouseEvent<HTMLElement>) => {
    const id = e.currentTarget.id;
    props(id);
  };

  return (
    <div>
      <button id="rock" onClick={choiceMade}>
        Rock
      </button>
      <button id="paper" onClick={choiceMade}>
        Paper
      </button>
      <button id="scissors" onClick={choiceMade}>
        Scissors
      </button>
    </div>
  );
};

export default RockPaperScissors;
