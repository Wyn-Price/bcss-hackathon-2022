const array10 = Array.from({ length: 10 })

export const BattleShipsGame = () => {
  return (
    <div className="w-full flex flex-row justify-center">
      <div className="inline-grid grid-cols-10 grid-rows-10 gap-0.5 bg-sky-600 w-fit p-2">
        {array10.map((_, x) => array10.map((_, y) => (
          <div className="bg-red-500 w-12 h-12" style={{
            gridColumn: `${x + 1}`,
            gridRow: `${y + 1}`
          }}>

          </div>
        )))}
      </div>
    </div>
  )
}