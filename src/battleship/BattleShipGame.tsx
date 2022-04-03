import { createContext, FC, MouseEventHandler, useCallback, useContext } from "react"
import { PlayerGameState, ShipPosition } from "../connection/BattleShipsGameData"
import { ConnectionManagerPlayer, useDataRecieved } from "../connection/ConnectionManager"
import { useListenableObject } from "../ListenableObject"
import { PlaceShipsArea } from "./PlaceShipsArea"
import { PlayBattleShipGame } from "./PlayBattleShipGame"

const array10 = Array.from({ length: 10 })


const PlayerGameStateContext = createContext<{
  playerState: PlayerGameState
  connection: ConnectionManagerPlayer
} | null>(null)

export const usePlayerGameState = () => {
  const ctx = useContext(PlayerGameStateContext)
  if (ctx === null) {
    throw new Error("Used outside of ctx");
  }
  return ctx
}

export const BattleShipsGame = ({ connection }: { connection: ConnectionManagerPlayer }) => {
  const [gameState, setGameState] = useListenableObject(connection.playerState.gameState)
  useDataRecieved(connection, useCallback(data => {
    if (gameState === "placing_tiles" && data.beginGame === true) {
      setGameState("play_game")
      connection.playerState.isSelfTurn.value = data.isSelfTurn
    }
  }, [gameState, connection, setGameState]))
  return (
    <PlayerGameStateContext.Provider value={{
      playerState: connection.playerState,
      connection
    }}>
      <div className="w-full flex flex-col items-center justify-center">
        {gameState === "placing_tiles" && <PlaceShipsArea />}
        {gameState === "play_game" && <PlayBattleShipGame />}
      </div>
    </PlayerGameStateContext.Provider>

  )
}

//playerData={playerData} isSelf={true}
export const Grid: FC<{ Tile: (props: { x: number, y: number }) => JSX.Element }> = ({ children, Tile }) => {
  return (
    <div
      className="inline-grid  bg-sky-600 w-fit p-2"
      style={{
        gridTemplateRows: `repeat(10, 3rem)`,
        gridTemplateColumns: `repeat(10, 3rem)`
      }}
    >
      {array10.map((_, x) => array10.map((_, y) => (
        <div className="w-12 h-12" style={{
          gridColumn: `${x + 1}`,
          gridRow: `${y + 1}`
        }}>
          <Tile key={`${x},${y}`} x={x} y={y} />
        </div>
      )))}
      {children}
    </div>
  )
}

export const PlacedShipsVisual = ({ shipPos, onClick, onContextMenu, backgroundColour = "bg-purple-300" }: {
  shipPos: ShipPosition,
  onClick?: MouseEventHandler<HTMLDivElement>
  onContextMenu?: MouseEventHandler<HTMLDivElement>,
  backgroundColour?: string
}
) => {
  return (
    <>
      <div
        onClick={onClick}
        onContextMenu={onContextMenu}
        className={backgroundColour + " bg-opacity-50"} style={{
          margin: '5px',
          gridColumnStart: `${shipPos.gridIndex.x + 1}`,
          gridColumnEnd: `${shipPos.gridIndex.x + 1 + (shipPos.rotated ? 0 : shipPos.ship.size)}`,

          gridRowStart: `${shipPos.gridIndex.y + 1 + (shipPos.rotated ? shipPos.ship.size : 0)}`,
          gridRowEnd: `${shipPos.gridIndex.y + 1}`,
        }} />
      <div
        onClick={onClick}
        onContextMenu={onContextMenu}
        className={(shipPos.rotated ? "rotate-90" : "")} style={{
          transformOrigin: "top left",
          width: `${3 * shipPos.ship.size}rem`,
          gridColumn: `${shipPos.gridIndex.x + 1}`,

          gridRow: `${shipPos.gridIndex.y + 1}`,
        }} >
        <div className={(shipPos.rotated ? "-translate-y-full" : "") + " w-full h-full flex justify-center opacity-100"}>
          <img className="h-full w-full scale-90 opacity-100" src={shipPos.ship.imgSrc} alt="Ship" />
        </div>
      </div>
    </>
  )

}
