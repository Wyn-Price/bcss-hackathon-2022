import { useDebugValue, useState } from "react"
import { Ship, ShipPosition, TileState } from "../connection/BattleShipsGameData"
import { ConnectionManagerPlayer, useDataRecieved } from "../connection/ConnectionManager"
import { Grid, PlacedShipsVisual, usePlayerGameState } from "./BattleShipGame"

export const PlayBattleShipGame = ({ selfTurnStart }: { selfTurnStart: boolean }) => {
  const { playerState, connection } = usePlayerGameState()
  const [isSelfTurn, setSelfTurn] = useState(selfTurnStart)
  useDataRecieved(connection, data => {
    if (data.isSelfTurn !== undefined) {
      setSelfTurn(data.isSelfPlaying)
    }
  })
  return (
    <div className="h-full flex flex-col items-center justify-center gap-10">
      <div className="w-full flex flex-row items-center justify-center gap-10">
        <GridWithShips ships={playerState.myShips} Tile={PlacingShipsTile(false, connection, playerState.myTiles)} />
        <GridWithShips ships={playerState.otherShips} Tile={PlacingShipsTile(isSelfTurn, connection, playerState.otherTiles)} />
      </div>
      <div>{isSelfTurn ? "Your Turn" : "Their Turn"}</div>

    </div>

  )
}

const GridWithShips = ({ ships, Tile }: { ships: Map<Ship, ShipPosition>, Tile: (props: { x: number, y: number }) => JSX.Element }) => {
  return (
    <Grid Tile={Tile}>
      {Array.from(ships.values()).map((pos, index) => <PlacedShipsVisual key={index} shipPos={pos} />)}
    </Grid>
  )
}

const PlacingShipsTile = (isOtherPlayersAndSelfTurn: boolean, connection: ConnectionManagerPlayer, tiles: readonly TileState[][]) => ({ x, y }: { x: number, y: number }) => {
  const tile = tiles[x][y]
  const getColourFromTile = () => {
    if (tile === "empty") {
      return "bg-blue-200"
    }
    if (tile === "fire_hit") {
      return "bg-red-800"
    }
    return "bg-white"
  }
  const canSelect = isOtherPlayersAndSelfTurn && tile === "empty"
  return (
    <div
      className="w-full h-full"
      style={{
        padding: '2px'
      }} >
      <div
        onClick={() => {
          connection.sendDataToEngine({
            gameTurnClickedGrid: { x, y }
          })
        }}
        className={getColourFromTile() + " w-full h-full " + (canSelect ? "hover:bg-blue-400" : "")}
      >
      </div>
    </div>
  )
}
