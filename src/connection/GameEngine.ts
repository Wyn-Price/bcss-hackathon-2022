import { MinigameCreators, minigames } from '../MiniGames/MinigameData';
import { Minigame } from '../MiniGames/Minigame';
import { ConnectionManager } from './ConnectionManager';
import { PlayerGameState, EnginePlayerGameState, findShipByName, ShipPosition } from './BattleShipsGameData';


export default class GameEngine {
  player1?: ConnectionManager
  player2?: ConnectionManager

  player1State = new EnginePlayerGameState()
  player2State = new EnginePlayerGameState()

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

  dataRecieved(player: ConnectionManager, data: any) {
    if (data.changeGameTo !== undefined) {
      const mg = data.changeGameTo as typeof minigames[number]
      this.currentGame = MinigameCreators[mg](this.player1, this.player2)
      const dataToSend = { isInternalMessage: true, startMinigame: data.changeGameTo }
      this.player1?.replyDataFromEngine(dataToSend)
      this.player2?.replyDataFromEngine(dataToSend)
      return
    }
    if (this.currentGame) {
      this.currentGame.dataRecieved(player, data)
    } else {
      this._battleshipDataRecieved(player, data)
    }
  }

  private _battleshipDataRecieved(player: ConnectionManager, data: any) {
    const playerState = player.player1 ? this.player1State : this.player2State
    if (data.shipsSet !== undefined) {
      const setShips: {
        ship: string;
        grid: {
          x: number;
          y: number;
        };
        rotated: boolean;
      }[] = data.shipsSet
      setShips.forEach(shipData => {
        const ship = findShipByName(shipData.ship)
        playerState.myShips.set(ship, new ShipPosition(ship, shipData.grid, shipData.rotated))
      })
      playerState.hasSetShips = true
      if (this.player1State.hasSetShips && this.player2State.hasSetShips) {
        this.player1?.replyDataFromEngine({ beginGame: true })
        this.player2?.replyDataFromEngine({ beginGame: true })
      }
    }
  }

}