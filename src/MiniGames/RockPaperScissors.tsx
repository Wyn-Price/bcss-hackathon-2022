import { useCallback, useState } from "react";
import { ConnectionManager, useDataRecieved } from "../connection/ConnectionManager";
import { Minigame } from "./Minigame";
import Rock from "./Images/rock.png";
import Scissors from "./Images/scissors.png";
import Paper from "./Images/paper.png";

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
            <div className="relative flex justify-evenly items-center min-h-screen bg-main">
                <div className="flex flex-col">
                    <img className="w-100 h-100 object-contain " src={Rock} />
                    <button id="rock" className={buttonStyle} onClick={choiceMade}>
                        Rock
                    </button>
                </div>
                <div className="flex flex-col">
                    <img className="w-100 h-100 object-contain" src={Paper} />
                    <button id="paper" className={buttonStyle} onClick={choiceMade}>
                        Paper
                    </button>
                </div>
                <div className="flex flex-col">
                    <img className="w-100 h-100 object-contain" src={Scissors} />
                    <button
                        id="scissors"
                        className={buttonStyle}
                        onClick={choiceMade}>
                        Scissors
                    </button>
                </div>

            </div>
        );
    } else {
        return (
            <div className="flex h-full justify-center items-center bg-main">
                <div className="flex flex-row text-4xl font-bold text-secondary">
                    <span>Awaiting other player</span>
                    <div className="animate-bounce">.</div>
                    <div className="animate-bounce">.</div>
                    <div className="animate-bounce">.</div>
                </div>
            </div>
        )
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
