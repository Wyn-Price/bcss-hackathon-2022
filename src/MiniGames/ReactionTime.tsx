import React, { useEffect, useRef, useState } from "react";
import { ConnectionManager, useDataRecieved } from "../connection/ConnectionManager";
import { Minigame } from "./Minigame";

export const ReactionTime = ({ connection }: { connection: ConnectionManager }) => {
  const [waitingForClick, setWaitingForClick] = useState(true)
  const [hasClicked, setHasClicked] = useState(false)

  useDataRecieved(connection, data => {
    if (data.setUserToNowClick === true) {
      setWaitingForClick(false)
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

  constructor(player1?: ConnectionManager, player2?: ConnectionManager) {
    super(player1, player2)
    setTimeout(() => {
      player1?.replyDataFromEngine({ setUserToNowClick: true })
      player2?.replyDataFromEngine({ setUserToNowClick: true })
    }, 3000 + Math.random() * 5000) //3 to 8 seconds
  }

  dataRecieved(player: ConnectionManager, data: any): void {
    if (data.setReactionTime !== undefined) {
      //Set the players reaction time
      if (player.player1) {
        this.player1ReactionTime = data.setReactionTime
      } else {
        this.player2ReactionTime = data.setReactionTime
      }

      //If both players have pressed, then end the game.
      //TODO: proceed the main game 
      if (this.player1ReactionTime !== undefined && this.player2ReactionTime !== undefined) {
        this.player1?.replyDataFromEngine({ isInternalMessage: true, endMinigame: true })
        this.player2?.replyDataFromEngine({ isInternalMessage: true, endMinigame: true })
      }
    }
  }
}
