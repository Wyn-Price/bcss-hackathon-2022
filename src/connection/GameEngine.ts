import { MinigameCreators, minigames } from '../MiniGames/MinigameData';
import { Minigame } from '../MiniGames/Minigame';
import { ConnectionManager } from './ConnectionManager';
import { EnginePlayerGameState, findShipByName, ShipPosition, TileState } from './BattleShipsGameData';


export default class GameEngine {
  player1?: ConnectionManager
  player2?: ConnectionManager

  player1State = new EnginePlayerGameState()
  player2State = new EnginePlayerGameState()

  gridPositionInQuestion?: { x: number, y: number }

  currentGame?: Minigame

  playerOneConnect(player: ConnectionManager) {
    this.player1 = player
    console.log("p1", player)
  }

  otherPlayerConnect(player: ConnectionManager) {
    this.player2 = player
    player.subscribeToDataRecieved(data => this.dataRecieved(player, data))
    console.log("p2", player)
  }

  playerOneWin() {
    console.log("p1 wins")
    this.endMinigameAndFireMissile(this.player1, this.player2State, this.player2)
  }

  playerTwoWin() {
    console.log("p2 wins")
    this.endMinigameAndFireMissile(this.player2, this.player1State, this.player1)
  }

  private endMinigameAndFireMissile(winner: ConnectionManager | undefined, loserState: EnginePlayerGameState, loser: ConnectionManager | undefined) {
    if (this.gridPositionInQuestion === undefined) {
      console.error("Tried to finish an unstarted game?")
      return
    }

    const grid = this.gridPositionInQuestion
    const isShip = Array.from(loserState.myShips.values()).some(ship => ship.getListOfPosition().some(pos => pos.x === grid.x && pos.y === grid.y))
    const newTile: TileState = isShip ? "fire_hit" : "fire_miss"
    loserState.myTiles[this.gridPositionInQuestion.x][this.gridPositionInQuestion.y] = newTile

    const isGameOver = Array.from(loserState.myShips.values()).every(shipPos =>
      shipPos.getListOfPosition().every(pos =>
        loserState.myTiles[pos.x][pos.y] === "fire_hit"
      )
    )

    if (isGameOver) {
      winner?.replyDataFromEngine({ isInternalMessage: true, gameOverIsWinner: true })
      loser?.replyDataFromEngine({ isInternalMessage: true, gameOverIsWinner: false })
    } else {
      const data = { isInternalMessage: true, grid: this.gridPositionInQuestion, newTile, endMinigame: true }
      winner?.replyDataFromEngine({ ...data, self: false })
      loser?.replyDataFromEngine({ ...data, self: true })
    }


    this.gridPositionInQuestion = undefined
    this.currentGame = undefined
  }

  dataRecieved(player: ConnectionManager, data: any) {
    if (data.resetBothClients) {
      this.player1?.replyDataFromEngine({ isInternalMessage: true, reset: true })
      this.player2?.replyDataFromEngine({ isInternalMessage: true, reset: true })
      this.player1State = new EnginePlayerGameState()
      this.player2State = new EnginePlayerGameState()
      this.currentGame = undefined
    }
    if (data.changeGameTo !== undefined) {
      this.setGameTo(data.changeGameTo)
      return
    }
    if (this.currentGame) {
      this.currentGame.dataRecieved(player, data)
    } else {
      this._battleshipDataRecieved(player, data)
    }
  }

  private setGameTo(mg: typeof minigames[number], player1Fired?: boolean) {
    const dataToSend = { isInternalMessage: true, startMinigame: mg }
    this.player1?.replyDataFromEngine(dataToSend)
    this.player2?.replyDataFromEngine(dataToSend)
    this.currentGame = MinigameCreators[mg](this, this.player1, this.player2, player1Fired ?? true)
  }

  private _battleshipDataRecieved(player: ConnectionManager, data: any) {
    if (data.shipsSet !== undefined) {
      this._battleshipSetShips(player, data.shipsSet)
    } else if (data.gameTurnClickedGrid !== undefined) {
      this._battleshipGridClicked(player.player1, data.gameTurnClickedGrid)
    }
  }

  private _battleshipGridClicked(player1Fired: boolean, gameTurnClickedGrid: { x: number; y: number }) {
    this.gridPositionInQuestion = gameTurnClickedGrid
    const minigame = minigames[Math.floor(minigames.length * Math.random())]
    this.setGameTo(minigame, player1Fired)
  }

  private _battleshipSetShips(player: ConnectionManager, setShips: {
    ship: string;
    grid: {
      x: number;
      y: number;
    };
    rotated: boolean;
  }[]) {
    const playerState = player.player1 ? this.player1State : this.player2State
    setShips.forEach(shipData => {
      const ship = findShipByName(shipData.ship)
      playerState.myShips.set(ship, new ShipPosition(ship, shipData.grid, shipData.rotated))
    })
    playerState.hasSetShips = true
    if (this.player1State.hasSetShips && this.player2State.hasSetShips) {
      this.player1?.replyDataFromEngine({ beginGame: true, isSelfTurn: true })
      this.player2?.replyDataFromEngine({ beginGame: true, isSelfTurn: false })
    }
  }
}