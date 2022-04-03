import { useCallback } from "react"
import { Ship, ShipPosition, TileState } from "../connection/BattleShipsGameData"
import { ConnectionManagerPlayer, useDataRecieved } from "../connection/ConnectionManager"
import { useListenableObject } from "../ListenableObject"
import { Grid, PlacedShipsVisual, usePlayerGameState } from "./BattleShipGame"

export const PlayBattleShipGame = () => {
  const { playerState, connection } = usePlayerGameState()
  const [isSelfTurn, setSelfTurn] = useListenableObject(connection.playerState.isSelfTurn)
  useDataRecieved(connection, useCallback(data => {
    if (data.isSelfTurn !== undefined) {
      setSelfTurn(data.isSelfPlaying)
    }
  }, [setSelfTurn]))
  return (
    <div className="h-full flex flex-col items-center justify-center gap-10">
      <div className="w-full flex flex-row items-center justify-center gap-10">
        <GridWithShips ships={playerState.myShips} Tile={PlacingShipsTile(false, connection, playerState.myTiles)} />
        <GridWithShips Tile={PlacingShipsTile(isSelfTurn, connection, playerState.otherTiles)} />
      </div>
      <div>{isSelfTurn ? "Your Turn" : "Their Turn"}</div>

    </div>

  )
}

const GridWithShips = ({ ships, Tile }: { ships?: Map<Ship, ShipPosition>, Tile: (props: { x: number, y: number }) => JSX.Element }) => {
  return (
    <Grid Tile={Tile}>
      {ships && Array.from(ships.values()).map((pos, index) => <PlacedShipsVisual key={index} shipPos={pos} />)}
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
          if (canSelect) {
            connection.sendDataToEngine({
              gameTurnClickedGrid: { x, y }
            })
          }
        }}
        className={getColourFromTile() + " w-full h-full " + (canSelect ? "hover:bg-blue-400" : "")}
      >
      </div>
    </div>
  )
}
