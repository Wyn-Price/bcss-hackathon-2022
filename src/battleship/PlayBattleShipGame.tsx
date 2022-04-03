import { SVGProps, useCallback } from "react"
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
    <div className="h-full flex flex-col items-center gap-10">
      <div className="w-[850px] flex flex-row items-center justify-around gap-[190px] mb-10 -mt-20">
        <h2 className="text-2xl font-bold">Your Board</h2>
        <div className="flex flex-col justify-center items-center">
          <div className={"w-16 h-16 overflow-visible pt-3"}>
            <ArrowIcon className={isSelfTurn ? "rotate-180" : ""} />
          </div>
          <div className="pt-3">{isSelfTurn ? "Your Turn" : "Their Turn"}</div>
        </div>

        <h2 className="text-2xl font-bold">Their Board</h2>
      </div>
      <div className="w-full flex flex-row items-center justify-center gap-[190px]">
        <GridWithShips ships={playerState.myShips} overlayTiles={playerState.myTiles} Tile={PlacingShipsTile(false, connection, playerState.myTiles)} />
        <GridWithShips overlayTiles={playerState.otherTiles} Tile={PlacingShipsTile(isSelfTurn, connection, playerState.otherTiles)} />
      </div>
    </div>
  )
}

const ArrowIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path xmlns="http://www.w3.org/2000/svg" d="M13 18v-4h-7v-4h7v-4l6 6-6 6zm-1-16c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z" />
    </svg>
  )
}

const GridWithShips = ({ ships, overlayTiles, Tile }: { ships?: Map<Ship, ShipPosition>, overlayTiles: readonly TileState[][], Tile: (props: { x: number, y: number }) => JSX.Element }) => {
  return (
    <Grid Tile={Tile}>
      {ships && Array.from(ships.values()).map((pos, index) => <PlacedShipsVisual key={index} shipPos={pos} />)}
      {overlayTiles.flatMap((outerArray, outerIndex) =>
        outerArray.map((tile, innerIndex) => ({ tile, innerIndex }))
          .filter(({ tile }) => tile !== "empty")
          .map(({ tile, innerIndex }) => {
            return (
              <div
                className={"pointer-events-none z-10 m-2.5 w-7 h-7 rounded-full " + (tile === "fire_hit" ? "bg-red-500" : "bg-white")}
                style={{
                  gridRow: `${innerIndex + 1}`,
                  gridColumn: `${outerIndex + 1}`
                }}
              >
              </div>
            )
          })
      )}
    </Grid>
  )
}



const PlacingShipsTile = (isOtherPlayersAndSelfTurn: boolean, connection: ConnectionManagerPlayer, tiles: readonly TileState[][]) => ({ x, y }: { x: number, y: number }) => {
  const tile = tiles[x][y]
  const getColourFromTile = () => {
    if (tile === "empty") {
      return "bg-blue-200 opacity-25"
    }
    if (tile === "fire_hit") {
      return "bg-red-800 opacity-30"
    }
    return "bg-white opacity-30"
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
        className={getColourFromTile() + " hover:bg-red-200 hover:opacity-50 w-full h-full " + (canSelect ? "hover:bg-blue-400" : "")}
      >
      </div>
    </div>
  )
}
