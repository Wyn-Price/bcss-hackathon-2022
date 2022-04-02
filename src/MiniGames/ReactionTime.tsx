import React, { useEffect, useRef, useState } from "react";
import { ConnectionManager, useDataRecieved } from "../connection/ConnectionManager";
import { Minigame } from "./Minigame";

const ReactionTime = ({ connection }: { connection: ConnectionManager }) => {
  const [waitingForClick, setWaitingForClick] = useState(false)
  const [hasClicked, setHasClicked] = useState(false)

  useDataRecieved(connection, data => {
    if (data.setUserToNowClick === true) {
      setWaitingForClick(false)
    }
  })


  // check time after screen has been pressed
  const clickHandler: () => void = () => {
    connection.sendDataToEngine({ setReactionTime: true })
  };

  return (
    <div
      id="reaction-screen min-h-screen"
      className={(waitingForClick ? "bg-gray-500" : "bg-green-500") + " min-h-screen flex justify-center items-center"}
      onClick={clickHandler}
    >
      <h2 onClick={clickHandler}>Click when green</h2>
    </div>
  );
};

//This is only run on the host.
export class ReactionTimeMinigame extends Minigame {

  player1ReactionTime?: number
  player2ReactionTime?: number

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

    }
  }
}

export default ReactionTime;
