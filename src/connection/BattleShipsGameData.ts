import ListenableObject from "../ListenableObject"
import { GameState } from './ConnectionManager';

export type TileState = "empty" | "fire_miss" | "fire_hit"

const createEmptyTiles = () =>
  Array.from({ length: 10 }).map(_ => Array.from({ length: 10 }).map(_ => "empty" as TileState))

export class Ship {
  constructor(
    readonly name: string,
    readonly size: number
  ) { }
}

const SHIP_CARRIER = new Ship("CARRIER", 5)
const SHIP_BATTLESHIP = new Ship("BATTLESHIP", 4)
const SHIP_CRUISER = new Ship("CRUISER", 3)
const SHIP_SUBMARINE = new Ship("SUBMARINE", 3)
const SHIP_DESTROYER = new Ship("DESTROYER", 2)

export const findShipByName = (name: string) => {
  const ship = ALL_SHIPS.find(s => s.name === name)
  if (ship === undefined) {
    throw new Error("Unable to find ship " + ship);
  }
  return ship
}

export const ALL_SHIPS = [SHIP_CARRIER, SHIP_BATTLESHIP, SHIP_CRUISER, SHIP_SUBMARINE, SHIP_DESTROYER]

export class ShipPosition {
  constructor(
    readonly ship: Ship,
    readonly gridIndex: { x: number, y: number },
    readonly rotated: boolean
  ) { }

  getListOfPosition() {
    const positions: { x: number, y: number }[] = [{ ...this.gridIndex }]
    for (let i = 0; i < this.ship.size; i++) {
      positions.push({
        x: this.gridIndex.x + (this.rotated ? 0 : i),
        y: this.gridIndex.y + (this.rotated ? i : 0),
      })
    }
    return positions
  }
}

//Stored on the engine
export class EnginePlayerGameState {
  myTiles: readonly TileState[][] = createEmptyTiles()
  myShips: Map<Ship, ShipPosition> = new Map()
  hasSetShips = false
}

//Stored locally per client
export class PlayerGameState extends EnginePlayerGameState {
  gameState = new ListenableObject<GameState>("placing_tiles")
  isSelfTurn = new ListenableObject(false)
  otherTiles: readonly TileState[][] = createEmptyTiles()

  prePlaceShipPositions = new ListenableObject<readonly ShipPosition[]>([])
  playingShipPosition = new ListenableObject<ShipPosition | null>(null)

}


