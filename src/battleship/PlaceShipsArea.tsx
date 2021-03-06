import { ALL_SHIPS, ShipPosition } from "../connection/BattleShipsGameData"
import { useListenableObject } from "../ListenableObject"
import { Grid, PlacedShipsVisual, usePlayerGameState } from "./BattleShipGame"

export const PlaceShipsArea = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Grid Tile={PlacingShipsTile}>
        <PlacingShip />
        <PlacedShips />
      </Grid>
      <UnplacedShips />
      {/* <DebugPlaceButton /> */}
    </div>
  )
}

const PlacingShip = () => {
  const { playerState: playerData, connection } = usePlayerGameState()
  const [selectedShip, setSelectedShip] = useListenableObject(playerData.playingShipPosition)
  const [otherShips] = useListenableObject(playerData.prePlaceShipPositions)

  const positions = selectedShip?.getListOfPosition()
  const isValid = positions !== undefined && !otherShips.some(ship =>
    ship.getListOfPosition().some(otherPos =>
      positions.some(pos =>
        pos.x === otherPos.x && pos.y === otherPos.y
      )
    )
  )
  return (
    <>
      {selectedShip !== null && !selectedShip.gridIndex.hideShip && <PlacedShipsVisual
        shipPos={selectedShip}
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          if (!isValid) {
            return
          }
          playerData.myShips.set(selectedShip.ship, selectedShip)
          playerData.prePlaceShipPositions.value = playerData.prePlaceShipPositions.value.concat(selectedShip)
          playerData.playingShipPosition.value = null

          if (playerData.prePlaceShipPositions.value.length === ALL_SHIPS.length) {
            connection.sendDataToEngine({
              shipsSet: playerData.prePlaceShipPositions.value.map(pos => ({
                ship: pos.ship.name,
                grid: { ...pos.gridIndex },
                rotated: pos.rotated
              }))
            })
          }

        }}
        onContextMenu={e => {
          e.preventDefault()
          e.stopPropagation()
          setSelectedShip(new ShipPosition(
            selectedShip.ship,
            selectedShip.gridIndex,
            !selectedShip.rotated
          ))
        }}
        backgroundColour={isValid ? "bg-purple-500" : "bg-red-500"}
      />}
    </>
  )
}

const PlacedShips = () => {
  const playerData = usePlayerGameState().playerState
  const [ships] = useListenableObject(playerData.prePlaceShipPositions)
  return (
    <>
      {ships.map((s, i) => <PlacedShipsVisual key={i} shipPos={s} />)}
    </>
  )
}

const UnplacedShips = () => {
  const playerData = usePlayerGameState().playerState
  const [placedShips] = useListenableObject(playerData.prePlaceShipPositions)
  const [selectedShip, setSelectedShip] = useListenableObject(playerData.playingShipPosition)
  const allShips = [...ALL_SHIPS].filter(ship => !placedShips.some(ps => ps.ship === ship))
  return (
    <div className="flex flex-row mt-5">
      {allShips.length === 0 && <h2 className="flex flex-row text-4xl font-bold">
        Waiting for opponent
        <div className="animate-bounce h-4">.</div>
        <div className="animate-bounce h-4 animation-delay-100">.</div>
        <div className="animate-bounce h-4 animation-delay-200">.</div>
      </h2>}
      {allShips.map((ship, index) => (
        <div key={index}
          className={"relative flex w-full flex-row justify-center items-center h-10 p-1 m-1 rounded-md " + (selectedShip?.ship === ship ? "bg-blue-400" : "bg-green-500 hover:bg-green-300")}
          style={{
            width: `${3 * ship.size}rem`
          }}
          onClick={() => {
            setSelectedShip(new ShipPosition(ship, { x: -1, y: -1, hideShip: true }, false))
          }}
        >
          <span className="z-10 font-bold text-white">{ship.name}</span>
          <div className="absolute left-0 top-0 w-full h-full">
            <img className="h-full w-full scale-90" src={ship.imgSrc} alt="Ship" />
          </div>

        </div>
      ))}
    </div>
  )
}

const PlacingShipsTile = ({ x, y }: { x: number, y: number }) => {
  const playerGameState = usePlayerGameState().playerState
  const [placing, setPlacing] = useListenableObject(playerGameState.playingShipPosition)

  return (
    <div
      className="w-full h-full"
      style={{
        padding: '2px'
      }}
      onMouseEnter={() => {
        if (placing) {
          if (placing.rotated) {
            if (y > 10 - placing.ship.size) {
              y = 10 - placing.ship.size
            }
          } else {
            if (x > 10 - placing.ship.size) {
              x = 10 - placing.ship.size
            }
          }
          setPlacing(new ShipPosition(placing.ship, { x, y }, placing.rotated))
        }
      }} >
      <div className=" bg-blue-200 bg-opacity-30 w-full h-full ">
        {/* {x}, {y} */}
      </div>
    </div>
  )
}

const DebugPlaceButton = () => {
  const { playerState, connection } = usePlayerGameState()
  const [placedShips] = useListenableObject(playerState.prePlaceShipPositions)
  const allShips = [...ALL_SHIPS].filter(ship => !placedShips.some(ps => ps.ship === ship))
  const place = () => {
    allShips.forEach((ship, index) => {
      const placement = new ShipPosition(ship, { x: 0, y: index }, false)
      playerState.myShips.set(ship, placement)
      playerState.prePlaceShipPositions.value = playerState.prePlaceShipPositions.value.concat(placement)
      playerState.playingShipPosition.value = null
    })
    connection.sendDataToEngine({
      shipsSet: playerState.prePlaceShipPositions.value.map(pos => ({
        ship: pos.ship.name,
        grid: { ...pos.gridIndex },
        rotated: pos.rotated
      }))
    })
  }
  return (
    <button onClick={place} className="bg-green-800 rounded p-2">Debug place</button>
  )
}