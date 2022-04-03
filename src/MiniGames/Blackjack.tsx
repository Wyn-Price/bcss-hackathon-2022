import { useCallback, useState } from "react";
import { ConnectionManager, useDataRecieved } from "../connection/ConnectionManager";
import GameEngine from "../connection/GameEngine";
import BlackjackCard from "./BlackjackCard";
import { Minigame } from "./Minigame";

const Blackjack = ({ connection }: { connection: ConnectionManager }) => {
    const [score, setScore] = useState(0);

    const [hand, setHand] = useState([]);
    const [opponentHand, setOpponentHand] = useState([]);
    const [myTurn, setMyTurn] = useState(false);

    const active = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";
    const inactive = "bg-grey-500 hover:bg-grey-700 text-white font-bold py-2 px-4 rounded";

    const tailwindPositions = ["top-0", "top-8", "top-16", "top-24", "top-32"]

    // receive the hands, re-render UI
    useDataRecieved(connection, useCallback((data) => {
        // set hands
        setHand(data.myHand);
        setScore(sum(data.myHand));
        setOpponentHand(data.otherHand);

        // set turn state
        setMyTurn(data.myTurn);
    }, []));

    const sum: (cards: [number, string][]) => number = (cards: [number, string][]) => {
        const initialValue = 0;
        return cards.reduce((previousValue, currentValue) => previousValue + currentValue[0], initialValue);
    };

    const hit: () => void = () => {
        connection.sendDataToEngine({ action: "hit" });
    };

    const fold: () => void = () => {
        connection.sendDataToEngine({ action: "fold" });
    };

    const ignore: () => void = () => { };

    return (
        <div className="flex flex-row justify-center items-center min-h-screen">
            <div className="flex flex-col justify-center items-center w-40">
                <h1>{opponentHand.length === 0 ? "" : "Opponent's last card:"}</h1>
                <BlackjackCard
                    value={opponentHand.length === 0 ? 0 : opponentHand[opponentHand.length - 1][0]}
                    suit={opponentHand.length === 0 ? "" : opponentHand[opponentHand.length - 1][1]}
                    marginDrop={"max-h-300"}
                />
            </div>
            <div className="flex flex-col gap-20 items-center m-40">
                <h1>Current Score: {score}</h1>
                <h2>{myTurn ? "It's your turn!" : "Waiting for opponent..."}</h2>
                <div className="flex flex-row gap-20">
                    <button className={myTurn ? active : inactive} onClick={myTurn ? hit : ignore}>
                        Hit
                    </button>
                    <button className={myTurn ? active : inactive} onClick={myTurn ? fold : ignore}>
                        Fold
                    </button>
                </div>
            </div>
            <div className="flex flex-col h-1/2 items-center">
                <h1>{hand?.length === 0 ? "" : "Last card:"}</h1>
                <div className="w-40 h-96 relative">

                    {hand?.length === 0 ? "" :
                        hand?.map((card, index) => (<BlackjackCard value={card[0]} suit={card[1]} marginDrop={("h-screen absolute " + tailwindPositions[index])} ></BlackjackCard>))}
                </div>
            </div>
        </div>
    );
};

export default Blackjack;

export class BlackjackMinigame extends Minigame {
    p1Hand: [number, string][];
    p2Hand: [number, string][];
    deck: [number, string][];
    p1?: ConnectionManager;
    p2?: ConnectionManager;

    constructor(gameEngine: GameEngine, player1?: ConnectionManager, player2?: ConnectionManager) {
        super(gameEngine, player1, player2);

        this.deck = this.newDeck();
        this.p1Hand = [];
        this.p2Hand = [];

        this.shuffle();
    }

    newDeck() {
        // cartesian product of two sets
        const cartesian = (...a: any[]) => a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));
        return cartesian([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], ["S", "H", "D", "C"]);
    }

    shuffle() {
        let currentIndex = this.deck.length,
            randomIndex;

        // While there remain elements to shuffle...
        while (currentIndex !== 0) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [this.deck[currentIndex], this.deck[randomIndex]] = [this.deck[randomIndex], this.deck[currentIndex]];
        }
    }

    // listener for client messages
    dataRecieved(player: ConnectionManager, data: any): void {
        // when player is listening
        // send the hands to each player
        if (data.dataReady !== undefined) {
            if (player.player1) {
                player.replyDataFromEngine({ myHand: this.p1Hand, otherHand: this.p2Hand, myTurn: true });
                this.p1 = player;
            } else {
                player.replyDataFromEngine({ myHand: this.p2Hand, otherHand: this.p1Hand, myTurn: false });
                this.p2 = player;
            }
        }
        if (data.action !== undefined) {
            this.handleNextMove(player, data.action);
        }
    }

    handleNextMove(player: ConnectionManager, action: string) {
        if (action === "hit") {
            this.hit(player);
        } else if (action === "fold") {
            this.fold(player);
        }
    }

    hit(player: ConnectionManager) {
        if (player.player1) {
            // draw a card
            this.p1Hand.push(this.deck.pop()!);

            // determine win, loss or continue
            var nextState = this.nextState(this.p1Hand);

            // player gets another turn
            if (nextState === "continue") {
                player.replyDataFromEngine({ myHand: this.p1Hand, otherHand: this.p2Hand, myTurn: true });
                this.player2.replyDataFromEngine({ myHand: this.p2Hand, otherHand: this.p1Hand, myTurn: false })

                // player wins, game ends
            } else if (nextState === "win") {
                player.replyDataFromEngine({ myHand: this.p1Hand, otherHand: this.p2Hand, myTurn: false });
                this.engine.playerOneWin();
                this.endGame();

                // player loses, game ends
            } else {
                player.replyDataFromEngine({ myHand: this.p1Hand, otherHand: this.p2Hand, myTurn: false });
                this.engine.playerTwoWin();
                this.endGame();
            }
        } else {
            this.p2Hand.push(this.deck.pop()!);
            var nextState2 = this.nextState(this.p2Hand);
            if (nextState2 === "continue") {
                player.replyDataFromEngine({ myHand: this.p2Hand, otherHand: this.p1Hand, myTurn: true });
                this.player1.replyDataFromEngine({ myHand: this.p1Hand, otherHand: this.p2Hand, myTurn: false })
            } else if (nextState2 === "win") {
                player.replyDataFromEngine({ myHand: this.p2Hand, otherHand: this.p1Hand, myTurn: false });
                this.engine.playerTwoWin();
                this.endGame();
            } else {
                player.replyDataFromEngine({ myHand: this.p2Hand, otherHand: this.p1Hand, myTurn: false });
                this.engine.playerOneWin();
                this.endGame();
            }
        }
    }

    // swaps the turn to the other player
    fold(player: ConnectionManager) {
        // tell the other play its their turn
        if (player.player1) {
            player.replyDataFromEngine({ myHand: this.p1Hand, otherHand: this.p2Hand, myTurn: false });
            this.p2?.replyDataFromEngine({ myHand: this.p2Hand, otherHand: this.p1Hand, myTurn: true });
        } else {
            player.replyDataFromEngine({ myHand: this.p2Hand, otherHand: this.p1Hand, myTurn: false });
            this.p1?.replyDataFromEngine({ myHand: this.p1Hand, otherHand: this.p2Hand, myTurn: false });

            // compare scores and define winner
            const p1score = this.sum(this.p1Hand);
            const p2score = this.sum(this.p2Hand);
            if (p1score === p2score) {
                // restart the game
                this.deck = this.newDeck();
                this.shuffle();

                this.p1Hand = [];
                this.p2Hand = [];

                // player one has to start cos game ends after p2 folds lol L player 2
                this.p1?.replyDataFromEngine({ myHand: this.p1Hand, otherHand: this.p2Hand, myTurn: true });
                this.p2?.replyDataFromEngine({ myHand: this.p2Hand, otherHand: this.p1Hand, myTurn: false });
            } else if (p1score > p2score) {
                this.engine.playerOneWin();
                this.endGame();
            } else {
                this.engine.playerTwoWin();
                this.endGame();
            }
        }
    }

    nextState(cards: [number, string][]) {
        const total = this.sum(cards);
        if (total === 21) {
            return "win";
        } else if (total > 21) {
            return "lose";
        } else {
            return "continue";
        }
    }

    sum(cards: [number, string][]) {
        const initialValue = 0;
        return cards.reduce((previousValue, currentValue) => previousValue + currentValue[0], initialValue);
    }

    endGame() {
        this.p1?.replyDataFromEngine({ myHand: this.p1Hand, otherHand: this.p2Hand, myTurn: false });
        this.p2?.replyDataFromEngine({ myHand: this.p2Hand, otherHand: this.p1Hand, myTurn: false });
    }
}
