import React from "react";
import { ConnectionManager } from "../connection/ConnectionManager";
import GameEngine from "../connection/GameEngine";
import "../stylesheets/index.css";
import { Minigame } from "./Minigame";

// const container = document.getElementById('root')
// if (!container) throw new Error("Missing root element")
// const root = ReactDOMClient.createRoot(container)

const NaughtsAndCrosses = () => {
    // if cross = true, then shape is cross, else shape is circle
    const [cross, updateCross] = React.useState(false);
    const [wins, updateWins] = React.useState([false, false, false, false, false, false, false, false, false]);
    const [gameEnded, updateGameEnded] = React.useState(false);
    const [texts, updateTexts] = React.useState(["", "", "", "", "", "", "", "", ""]);
    let numbers: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    const checkForWin = () => {
        let win1 = texts[0] == texts[1] && texts[0] == texts[2] && texts[0] != "";
        let win2 = texts[3] == texts[4] && texts[3] == texts[5] && texts[3] != "";
        let win3 = texts[6] == texts[7] && texts[6] == texts[8] && texts[6] != "";

        let win4 = texts[0] == texts[3] && texts[0] == texts[6] && texts[0] != "";
        let win5 = texts[1] == texts[4] && texts[1] == texts[7] && texts[1] != "";
        let win6 = texts[2] == texts[8] && texts[2] == texts[5] && texts[2] != "";

        let win7 = texts[0] == texts[4] && texts[0] == texts[8] && texts[0] != "";
        let win8 = texts[2] == texts[4] && texts[2] == texts[6] && texts[2] != "";

        let typesOfWins = [win1, win2, win3, win4, win5, win6, win7, win8];

        updateWins(typesOfWins);

        if (typesOfWins.some((element) => element)) {
            // Do something to show games ended
            alert("W");
        }
    };

    const registerClick = ({ pos }: { pos: number }) => {
        if (texts[pos] == "") {
            if (cross) {
                texts[pos] = "X";
            } else {
                texts[pos] = "O";
            }
            updateTexts(texts);
            updateCross(!cross);
        }
        checkForWin();
    };

    const Square = ({ pos }: { pos: number }) => {
        return (
            <div className="bg-white flex items-center justify-center rounded-full" onClick={() => registerClick({ pos })}>
                <header className="text-5xl text-purple-600">{texts[pos]}</header>
            </div>
        );
    };

    return (
        <div id="container" className="h-full overflow-hidden bg-purple-600">
            <div id="header" className="flex h-28 items-center justify-center bg-purple-600">
                <header className="flex items-center justify-center text-8xl">Naughts and Crosses</header>
            </div>
            <div id="board" className="flex h-screen items-center justify-center">
                <div className="grid grid-rows-3 grid-cols-3 gap-4 h-96 w-96 bg-black p-2 rounded-2xl mb-28">
                    {numbers.map((number) => (
                        <Square pos={number}></Square>
                    ))}
                </div>
            </div>
        </div>
    );
};

const playMove = (cross: boolean) => {
    return <div className="bg-black">{cross}</div>;
};

export default NaughtsAndCrosses;

export class NaughtsAndCrossesMinigame extends Minigame {
    p1choice?: number;
    p2choice?: number;
    next: number = 1;

    constructor(gameEngine: GameEngine, player1?: ConnectionManager, player2?: ConnectionManager) {
        super(gameEngine, player1, player2);

        // game setup
        this.next = 1;

        // this sends the data to each client, a client
        // receives this from the useDataReceived hook
        player1?.replyDataFromEngine({ readyToChoose: true });
        player2?.replyDataFromEngine({ readyToChoose: false });
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
