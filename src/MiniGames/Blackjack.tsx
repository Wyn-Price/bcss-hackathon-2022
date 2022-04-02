import { useState } from "react";
import {
    ConnectionManager,
    useDataRecieved,
} from "../connection/ConnectionManager";
import BlackjackCard from "./BlackjackCard";
import { Minigame } from "./Minigame";

const Blackjack = ({ connection }: { connection: ConnectionManager }) => {
    const [score, setScore] = useState(0);
    const [lastCard, setLastCard] = useState({ value: 0, suit: "" });
    const [message, setMessage] = useState(
        "Keep it below 21! But beat your opponent!"
    );
    var cards: [number, string][];

    const buttonStyle =
        "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

    // receive the card sequence
    useDataRecieved(connection, (data) => {
        cards = data.cards;
    });

    // send final score
    const submitScore: () => void = () => {
        connection.sendDataToEngine({ score: score });
    };

    const dealAnother = () => {
        // pull card from deck
        const card = cards.pop();
        if (card !== undefined) {
            const newScore = score + card[0];

            setLastCard({ value: card[0], suit: card[1] });

            // check if score == 21 (win), above (lose), or below (continue)
            if (newScore == 21) {
                setMessage("You got 21!");
                submitScore();
            } else if (newScore > 21) {
                setMessage("Unlucky... you got " + newScore);
                submitScore();
            } else {
                setScore(newScore);
            }
        } else {
            alert("Card is undefined: Blackjack.tsx, dealAnother()");
        }
    };

    return (
        <div className="flex flex-row justify-center items-center min-h-screen">
            <div className="flex flex-col gap-20 items-center m-40">
                <h1>Current Score: {score}</h1>
                <h2>{message}</h2>
                <div className="flex flex-row gap-20">
                    <button className={buttonStyle} onClick={dealAnother}>
                        Hit
                    </button>
                    <button className={buttonStyle} onClick={submitScore}>
                        Fold
                    </button>
                </div>
            </div>
            <div className="flex flex-col justify-center items-center w-40">
                <h1>Last card:</h1>
                <BlackjackCard value={lastCard.value} suit={lastCard.suit} />
            </div>
        </div>
    );
};

export default Blackjack;

export class BlackjackMinigame extends Minigame {
    p1Score?: number;
    p2Score?: number;
    deck: [number, string][];
    cardSequence: [number, string][];

    constructor(player1?: ConnectionManager, player2?: ConnectionManager) {
        super(player1, player2);
        // cartesian product of two sets
        const cartesian = (...a: any[]) =>
            a.reduce((a, b) =>
                a.flatMap((d: any) => b.map((e: any) => [d, e].flat()))
            );

        // whatever the game needs to start goes here
        this.deck = cartesian(
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            ["S", "H", "D", "C"]
        );

        this.cardSequence = this.generateCardSequence();

        // this sends the same card sequence to each client, a client
        // receives this from the useDataReceived hook
        player1?.replyDataFromEngine({ cards: this.cardSequence });
        player2?.replyDataFromEngine({ cards: this.cardSequence });
    }

    generateCardSequence() {
        var total = 0;
        var sequence = [];

        while (total < 21) {
            var card = this.drawCard();
            sequence.push(card);
            total += card[0];
        }

        return sequence;
    }

    drawCard() {
        var card = this.deck[Math.floor(Math.random() * this.deck.length)];
        this.removeCard(card[0], card[1]);
        return card;
    }

    removeCard(val: number, suit: string) {
        this.deck = this.deck.filter(function (item) {
            return item !== [val, suit];
        });
    }

    dataRecieved(player: ConnectionManager, data: any): void {
        if (data.scoreReceived !== undefined) {
            //Set the players reaction time
            if (player.player1) {
                this.p1Score = data.score;
            } else {
                this.p2Score = data.score;
            }

            //If both players have finished, then end the game.
            //TODO: proceed the main game
            if (this.p1Score !== undefined && this.p2Score !== undefined) {
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
