import { MinigameCreators, minigames } from '../MiniGames/MinigameData';
import { Minigame } from '../MiniGames/Minigame';
import { ConnectionManager } from './ConnectionManager';


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
    }
  }

}