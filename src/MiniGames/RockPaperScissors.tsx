import { useCallback, useState } from "react";
import { ConnectionManager, useDataRecieved } from "../connection/ConnectionManager";
import GameEngine from "../connection/GameEngine";
import { Minigame } from "./Minigame";

const RockPaperScissors = ({ connection }: { connection: ConnectionManager }) => {
    const [choice, setChoice] = useState(false);

    // send choice
    const choiceMade = (e: React.MouseEvent<HTMLElement>) => {
        const id = e.currentTarget.id;
        connection.sendDataToEngine({ choice: id });
    };

    // receive the card sequence
    useDataRecieved(connection, useCallback((data) => {
        setChoice(data.readyToChoose);
    }, []));

    const buttonStyle =
        "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

    if (choice) {
        return (
            <div className="flex justify-evenly items-center min-h-screen">
                <button id="rock" className={buttonStyle} onClick={choiceMade}>
                    Rock
                </button>
                <button id="paper" className={buttonStyle} onClick={choiceMade}>
                    Paper
                </button>
                <button
                    id="scissors"
                    className={buttonStyle}
                    onClick={choiceMade}
                >
                    Scissors
                </button>
            </div>
        );
    } else {
        return <h1>Awaiting other player...</h1>;
    }
};

export default RockPaperScissors;

export class RPSMinigame extends Minigame {
    p1choice?: string;
    p2choice?: string;

    // constructor(gameEngine: GameEngine, player1?: ConnectionManager, player2?: ConnectionManager) {
    //     super(gameEngine, player1, player2);
    //     // game setup

    //     // this sends the data to each client, a client
    //     // receives this from the useDataReceived hook
    // }

    restartGame() {
        this.p1choice = undefined;
        this.p2choice = undefined;
        this.player1?.replyDataFromEngine({ readyToChoose: true });
        this.player2?.replyDataFromEngine({ readyToChoose: true });
    }

    dataRecieved(player: ConnectionManager, data: any): void {
        // receive the data
        if (data.dataReady !== undefined) {
            player.replyDataFromEngine({ readyToChoose: true });
        }
        if (data.choice !== undefined) {
            if (player.player1) {
                this.p1choice = data.choice;
                this.player1?.replyDataFromEngine({ readyToChoose: false });
            } else {
                this.p2choice = data.choice;
                this.player2?.replyDataFromEngine({ readyToChoose: false });
            }
        }

        // If both players have finished, determine winner
        if (this.p1choice !== undefined && this.p2choice !== undefined) {
            // handle draw
            if (this.p1choice === this.p2choice) {
                this.restartGame();
                // determine winner
            } else if (this.p1choice === "rock" && this.p2choice === "scissors") {
                this.engine.playerOneWin();
            } else if (this.p1choice === "scissors" && this.p2choice === "paper") {
                this.engine.playerOneWin();
            } else if (this.p1choice === "paper" && this.p2choice === "rock") {
                this.engine.playerOneWin();
            } else {
                this.engine.playerTwoWin();
            }
        }
    }
}
