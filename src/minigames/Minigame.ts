import { ConnectionManager } from './../connection/ConnectionManager';
export class Minigame {

  player1: ConnectionManager
  player2: ConnectionManager

  constructor(player1?: ConnectionManager, player2?: ConnectionManager) {
    if (player1 === undefined || player2 === undefined) {
      throw new Error(player1 + ", " + player2);

    }
    this.player1 = player1;
    this.player2 = player2;
  }

  dataRecieved(player: ConnectionManager, data: any) {
    console.log(`Player{isMainPlayer=${player.player1}} sent: `, data)

  }
}

export class ReplyToEachotherMinigame extends Minigame {

  //Update Both Players UI
  dataRecieved(player: ConnectionManager, data: any): void {
    console.log(`Player{isMainPlayer=${player.player1}} sent: `, data)
    this.player1.replyDataFromEngine({ text: `[${player.player1 ? "You" : "Them"}] ${data.input}` })
    this.player2.replyDataFromEngine({ text: `[${player.player1 ? "Them" : "You"}] ${data.input}` })
  }
}