import { createContext, FC, MouseEventHandler, useContext, useState } from "react"
import { ALL_SHIPS, PlayerGameState, ShipPosition } from "../connection/BattleShipsGameData"
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
  useDataRecieved(connection, data => {
    if (gameState === "placing_tiles" && data.beginGame === true) {
      setGameState("play_game")
      connection.playerState.isSelfTurn.value = data.isSelfTurn
    }
  })
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
    <div className="inline-grid grid-cols-10 grid-rows-10 bg-sky-600 w-fit p-2">
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
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={backgroundColour} style={{
        margin: '5px',
        border: '1px solid black',
        gridColumnStart: `${shipPos.gridIndex.x + 1}`,
        gridColumnEnd: `${shipPos.gridIndex.x + 1 + (shipPos.rotated ? 0 : shipPos.ship.size)}`,

        gridRowStart: `${shipPos.gridIndex.y + 1 + (shipPos.rotated ? shipPos.ship.size : 0)}`,
        gridRowEnd: `${shipPos.gridIndex.y + 1}`,
      }} />
  )

}
