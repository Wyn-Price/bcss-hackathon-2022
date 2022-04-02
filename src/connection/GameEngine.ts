import { Minigame } from '../MiniGames/Minigame';
import { ConnectionManager } from './ConnectionManager';

// export interface GameEngine {
//   otherPlayerConnect: (player: ConnectionManager) => void
// }
export default class GameEngine {
  player1?: ConnectionManager
  player2?: ConnectionManager

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
    if (this.currentGame) {
      this.currentGame.dataRecieved(player, data)
    }
  }

}