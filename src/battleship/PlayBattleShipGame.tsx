import { Ship, ShipPosition, TileState } from "../connection/BattleShipsGameData"
import { Grid, PlacedShipsVisual, usePlayerGameState } from "./BattleShipGame"

export const PlayBattleShipGame = () => {
  const { playerState } = usePlayerGameState()
  return (
    <div className="w-full flex flex-row items-center justify-center gap-10">
      <GridWithShips ships={playerState.myShips} tiles={playerState.myTiles} />
      <GridWithShips ships={playerState.otherShips} tiles={playerState.otherTiles} />
    </div>
  )
}

const GridWithShips = ({ ships, tiles }: { ships: Map<Ship, ShipPosition>, tiles: readonly TileState[][] }) => {
  return (
    <Grid Tile={PlacingShipsTile}>
      {Array.from(ships.values()).map((pos, index) => <PlacedShipsVisual key={index} shipPos={pos} />)}
    </Grid>
  )
}

const PlacingShipsTile = ({ x, y }: { x: number, y: number }) => {
  return (
    <div
      className="w-full h-full"
      style={{
        padding: '2px'
      }} >
      <div className=" bg-blue-200 w-full h-full ">
        {x}, {y}
      </div>
    </div>
  )
}
