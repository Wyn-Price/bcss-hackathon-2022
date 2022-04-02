import { ConnectionManager } from './Connection';

// export interface GameEngine {
//   otherPlayerConnect: (player: ConnectionManager) => void
// }
export default class GameEngine {
  player1?: ConnectionManager
  player2?: ConnectionManager

  playerOneConnect(player: ConnectionManager) {
    this.player1 = player
    console.log("p1", player)
  }

  otherPlayerConnect(player: ConnectionManager) {
    this.player2 = player
    console.log("p2", player)
  }
}