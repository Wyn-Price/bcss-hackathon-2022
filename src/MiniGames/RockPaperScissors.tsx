import { useState } from "react";
import {
    ConnectionManager,
    useDataRecieved,
} from "../connection/ConnectionManager";
import { Minigame } from "./Minigame";

const RockPaperScissors = ({
    connection,
}: {
    connection: ConnectionManager;
}) => {
    const [choice, setChoice] = useState(false);

    // send choice
    const choiceMade = (e: React.MouseEvent<HTMLElement>) => {
        const id = e.currentTarget.id;
        connection.sendDataToEngine({ choice: id });
    };

    // receive the card sequence
    useDataRecieved(connection, (data) => {
        setChoice(data.readyToChoose);
    });

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
    p1choice?: number;
    p2choice?: number;

    constructor(player1?: ConnectionManager, player2?: ConnectionManager) {
        super(player1, player2);
        // game setup

        // this sends the data to each client, a client
        // receives this from the useDataReceived hook
        player1?.replyDataFromEngine({ readyToChoose: true });
        player2?.replyDataFromEngine({ readyToChoose: true });
    }

    restartGame() {
        this.p1choice = undefined;
        this.p2choice = undefined;
        this.player1?.replyDataFromEngine({ readyToChoose: true });
        this.player2?.replyDataFromEngine({ readyToChoose: true });
    }

    dataRecieved(player: ConnectionManager, data: any): void {
        // receive the data
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
            } else {
                // determine winner
                this.player1?.replyDataFromEngine({
                    isInternalMessage: true,
                    endMinigame: true,
                });
                this.player2?.replyDataFromEngine({
                    isInternalMessage: true,
                    endMinigame: true,
                });
            }
        }
    }
}
