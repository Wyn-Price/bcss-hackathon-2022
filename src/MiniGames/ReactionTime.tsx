import React, { useEffect, useRef, useState } from "react";
import { ConnectionManager, useDataRecieved } from "../connection/ConnectionManager";
import GameEngine from "../connection/GameEngine";
import { Minigame } from "./Minigame";

export const ReactionTime = ({ connection }: { connection: ConnectionManager }) => {
  const [waitingForClick, setWaitingForClick] = useState(true)
  const [hasClicked, setHasClicked] = useState(false)

  useDataRecieved(connection, data => {
    if (data.setUserToNowClick === true) {
      setWaitingForClick(false)
    }
    if (data.needsResetting === true) {
      setWaitingForClick(true)
      setHasClicked(false)
    }
  })


  // check time after screen has been pressed
  const clickHandler: () => void = () => {
    connection.sendDataToEngine({ setReactionTime: true })
    setHasClicked(true)
  };

  return (
    <div
      id="reaction-screen min-h-screen"
      className={(hasClicked ? "bg-blue-500" : (waitingForClick ? "bg-gray-500" : "bg-green-500")) + " min-h-screen flex justify-center items-center"}
      onClick={clickHandler}
    >
      <h2 onClick={clickHandler}>{hasClicked ? "Clicked :)" : (waitingForClick ? "Click When Green" : "CLICK!!")}</h2>
    </div>
  );
};

//This is only run on the host.
export class ReactionTimeMinigame extends Minigame {

  player1ReactionTime?: boolean
  player2ReactionTime?: boolean

  runningTimeout?: NodeJS.Timeout

  constructor(engine: GameEngine, player1?: ConnectionManager, player2?: ConnectionManager) {
    super(engine, player1, player2)
    this.sendTimeout()
  }

  private sendTimeout() {
    this.runningTimeout = setTimeout(() => {
      this.runningTimeout = undefined
      this.player1?.replyDataFromEngine({ setUserToNowClick: true })
      this.player2?.replyDataFromEngine({ setUserToNowClick: true })
    }, 3000 + Math.random() * 5000) //3 to 8 seconds
  }

  dataRecieved(player: ConnectionManager, data: any): void {
    if (data.setReactionTime !== undefined) {

      //Set the players reaction time
      if (player.player1) {
        this.player1ReactionTime = true
      } else {
        this.player2ReactionTime = true
      }

      //If both players have pressed, then end the game.
      if (this.player1ReactionTime !== undefined && this.player2ReactionTime !== undefined) {
        //Both players are dumb and clicked before it went green
        if (this.runningTimeout !== undefined) {
          clearTimeout(this.runningTimeout)
          this.sendTimeout()

          this.player1.replyDataFromEngine({ needsResetting: true })
          this.player2.replyDataFromEngine({ needsResetting: true })

        } else {
          if (player.player1) {
            this.engine.playerTwoWin()
          } else {
            this.engine.playerOneWin()
          }
        }
      }
    }
  }
}
