import React, { useCallback, useState } from "react";
import { ConnectionManager, useDataRecieved } from "../connection/ConnectionManager";
import GameEngine from "../connection/GameEngine";
import "../stylesheets/index.css";
import { Minigame } from "./Minigame";

// const container = document.getElementById('root')
// if (!container) throw new Error("Missing root element")
// const root = ReactDOMClient.createRoot(container)

const NaughtsAndCrosses = ({ connection }: { connection: ConnectionManager }) => {
    // fetched from network
    const [awaitingTurn, setAwaitingTurn] = useState(false);
    const [board, setBoard] = React.useState<readonly string[]>(["", "", "", "", "", "", "", "", ""]);
    let numbers: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];



    const checkForWin = useCallback((report: boolean) => {
        let win1 = board[0] === board[1] && board[0] === board[2] && board[0] !== "";
        let win2 = board[3] === board[4] && board[3] === board[5] && board[3] !== "";
        let win3 = board[6] === board[7] && board[6] === board[8] && board[6] !== "";

        let win4 = board[0] === board[3] && board[0] === board[6] && board[0] !== "";
        let win5 = board[1] === board[4] && board[1] === board[7] && board[1] !== "";
        let win6 = board[2] === board[5] && board[2] === board[8] && board[2] !== "";

        let win7 = board[0] === board[4] && board[0] === board[8] && board[0] !== "";
        let win8 = board[2] === board[4] && board[2] === board[6] && board[2] !== "";

        let typesOfWins = [win1, win2, win3, win4, win5, win6, win7, win8];

        if (typesOfWins.some((element) => element)) {
            // update UI to show win here !!
            if (report) {
                // reports it to server, doesn't when board has been received
                connection.sendDataToEngine({ won: true });
            }
        } else {
            if (board.every((val: string) => val !== "")) {
                connection.sendDataToEngine({ draw: true });
            }
        }
    }, [board, connection]);

    // get data from server
    useDataRecieved(connection, useCallback((data) => {
        setAwaitingTurn(data.readyToChoose);
        setBoard(data.board);
        checkForWin(data.hasJustFinishedSelfMove ?? false);
    }, [checkForWin]));


    const registerClick = ({ pos }: { pos: number }) => {
        if (board[pos] === "") {
            connection.sendDataToEngine({ turnEnded: true, position: pos });
            checkForWin(true);
        }
    };

    const Square = ({ pos, clickable }: { pos: number; clickable: boolean }) => {
        return (
            <div className="bg-white flex items-center justify-center rounded-full" onClick={clickable ? () => registerClick({ pos }) : () => { }}>
                <header className="text-5xl text-secondary">{board[pos]}</header>
            </div>
        );
    };

    return (
        <div id="container" className="flex flex-col relative h-full overflow-hidden bg-main mb-28">
            <h1 className="absolute top-12 mx-auto w-full text-center text-6xl font-bold">NAUGHTS & CROSSES</h1>
            <div id="board" className="flex flex-col h-screen items-center justify-center">
                <div className="grid grid-rows-3 grid-cols-3 gap-4 h-96 w-96 bg-black p-4 rounded-2xl">
                    {numbers.map((number) => (
                        <Square pos={number} clickable={awaitingTurn}></Square>
                    ))}
                </div>
                <h1 className="flex flex-row text-2xl font-bold">{awaitingTurn ? "Your move!" : <>
                    Waiting for opponent
                    <div className="animate-bounce h-4">.</div>
                    <div className="animate-bounce h-4 animation-delay-200">.</div>
                    <div className="animate-bounce h-4 animation-delay-400">.</div>
                </>}</h1>
            </div>

        </div>
    );
};


export default NaughtsAndCrosses;

export class NaughtsAndCrossesMinigame extends Minigame {
    board: string[];
    p1token = "X";
    p2token = "O";
    p1First: boolean;

    constructor(gameEngine: GameEngine, player1: ConnectionManager | undefined, player2: ConnectionManager | undefined, p1First: boolean) {
        super(gameEngine, player1, player2);

        // game setup
        this.board = ["", "", "", "", "", "", "", "", ""];
        this.p1First = p1First;

        // this sends the data to each client, a client
        // receives this from the useDataReceived hook
    }

    player1TurnEnded(pos: number) {
        this.board[pos] = this.p1token;
        this.player1?.replyDataFromEngine({ readyToChoose: false, hasJustFinishedSelfMove: true, board: this.board });
        this.player2?.replyDataFromEngine({ readyToChoose: true, hasJustFinishedSelfMove: false, board: this.board });
    }

    player2TurnEnded(pos: number) {
        this.board[pos] = this.p2token;
        this.player1?.replyDataFromEngine({ readyToChoose: true, hasJustFinishedSelfMove: false, board: this.board });
        this.player2?.replyDataFromEngine({ readyToChoose: false, hasJustFinishedSelfMove: true, board: this.board });
    }

    dataRecieved(player: ConnectionManager, data: any): void {
        if (data.dataReady !== undefined) {
            if (player.player1) {
                player.replyDataFromEngine({ readyToChoose: this.p1First, board: this.board });
            } else {
                player.replyDataFromEngine({ readyToChoose: !this.p1First, board: this.board });
            }
        }

        // end game on a winner
        if (data.won !== undefined) {
            if (player.player1) {
                this.engine.playerOneWin();
            } else {
                this.engine.playerTwoWin();
            }
            this.player1?.replyDataFromEngine({ readyToChoose: false, board: this.board });
            this.player2?.replyDataFromEngine({ readyToChoose: false, board: this.board });
        }

        // when one player's turn ends
        if (data.turnEnded) {
            if (player.player1) {
                this.player1TurnEnded(data.position);
            } else {
                this.player2TurnEnded(data.position);
            }
        }

        // restart
        if (data.draw !== undefined) {
            this.board = ["", "", "", "", "", "", "", "", ""];
            this.p1First = !this.p1First;
            this.player1.replyDataFromEngine({ readyToChoose: this.p1First, board: this.board });
            this.player2.replyDataFromEngine({ readyToChoose: !this.p1First, board: this.board });
        }
    }
}
