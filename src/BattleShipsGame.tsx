const size = 100;
const numbers = Array.from({length: size}, (_, index) => index + 1);

const BattleShipsGame = () => {
  return (
    <div className="inline-grid grid-cols-10 grid-rows-10 gap-0.5 bg-sky-600 w-screen h-screen p-2">
      {numbers.map(number => <div className="bg-gray-700 h-18	w-38 justify-between justify-center"> </div>)}
    </div>
  )
}



export default BattleShipsGame