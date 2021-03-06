import React, { useCallback, useMemo } from "react";
import star from '../assets/crown.png';
import { ConnectionManager, useDataRecieved } from "../connection/ConnectionManager";
import GameEngine from "../connection/GameEngine";
import "../stylesheets/index.css";
import { Minigame } from "./Minigame";

// const container = document.getElementById('root')
// if (!container) throw new Error("Missing root element")
// const root = ReactDOMClient.createRoot(container)

// const MathGame = () => {

export const MathGame = ({ connection }: { connection: ConnectionManager }) => {
    const [currentQuestion, updateCurrentQuestion] = React.useState(0);
    const [p1Score, updateScore1] = React.useState(0);
    const [p2Score, updateScore2] = React.useState(0);

    const [questions, setQuestions] = React.useState([]);
    const [answers, setAnswers] = React.useState<readonly number[]>([]);

    const [winner] = React.useState(undefined);

    const empty: number[] = []

    useDataRecieved(connection, useCallback((data) => {
        if (data.setQuestionsAndAnswers === true) {
            setQuestions(data.questions);
            setAnswers(data.answers);
        }
        if (data.updatePlayerScores === true) {
            updateScore1(data.p1Score);
            updateScore2(data.p2Score);
        }

    }, []));

    const options = useMemo(() => {
        var options: number[] = [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)];
        options.splice(Math.floor(Math.random() * 3), 0, answers[currentQuestion]);
        return options
    }, [answers, currentQuestion])

    const Question = () => {
        if (winner === undefined) {
            return (
                <div className="flex flex-col items-center justify-center bg-white rounded-2xl h-fit w-96 py-10 px-5">
                    <div className="flex">
                        <header className="text-4xl font-bold">{questions[currentQuestion]} =</header>
                        <header className="text-4xl text-red-700 font-bold">?</header>
                    </div>
                    <Selections answer={answers[currentQuestion]} options={options}></Selections>
                </div>
            );
        } else {
            return (
                <div className="flex items-center justify-center h-48 w-96 mb-80">
                    <header className="text-white text-6xl font-bold underline">Player {winner} wins</header>
                </div>
            );
        }
    };

    // Sends the score to the server if there is ever an update
    const sendUpdatedScore = () => {
        connection.sendDataToEngine({ p1Score: p1Score, p2Score: p2Score });
    };

    const Selections = ({ answer, options }: { answer: number, options: number[] }) => {


        let gameOver = false;
        if (winner !== undefined) {
            gameOver = true;
        }

        return (
            <div>
                <div className={(gameOver ? "hidden" : "") + "mx-2 mb-3 mt-5 bg-white grid grid-cols-2 grid-rows-2"}>
                    {options.map((option) => (
                        <div
                            className="flex items-center cursor-pointer hover:bg-gray-100 justify-center border-2 m-5 p-2 rounded-full"
                            onClick={() => CheckAnswer(option, answer)}>
                            <header className="text-3xl">{option}</header>
                        </div>
                    ))}
                </div>
            </div>
        );

        function CheckAnswer(selected: number, answer: number) {
            if (selected === answer) {
                updateCurrentQuestion(currentQuestion + 1);

                sendUpdatedScore();
            }
        }
    };

    return (
        <div className="h-screen flex bg-main justify-evenly">
            <div className="flex flex-col w-1/4 items-center justify-center">
                {p1Score > p2Score ? <img className="h-[100px] w-[100px]" src={star}></img> : ""}
                <h1 className="text-4xl font-bold text-secondary">Player 1</h1>
                <h2 className="text-4xl text-secondary">{p1Score} / 5</h2>
            </div>

            <div className="flex flex-col items-center justify-between w-1/2">
                <div className="flex items-center h-1/6">
                    <header className="flex items-center font-bold justify-center text-6xl">QUICK MATHS</header>
                </div>
                <div className="flex items-center h-5/6">
                    <Question></Question>
                </div>
            </div>

            <div className="flex flex-col w-1/4 items-center justify-center">
                {p2Score > p1Score ? <img className="h-[100px] w-[100px]" src={star}></img> : ""}
                <h1 className="text-4xl font-bold text-secondary">Player 2</h1>
                <h2 className="text-4xl text-secondary">{p2Score} / 5</h2>
            </div>
        </div>
    );
};

export default MathGame;

export class MathMinigame extends Minigame {
    p1Score?: number;
    p2Score?: number;
    winner?: number;

    questions: string[] = [];
    answers: number[] = [];

    constructor(gameEngine: GameEngine, player1?: ConnectionManager, player2?: ConnectionManager) {
        super(gameEngine, player1, player2);
        this.createQuestionList();
        // eslint-disable-next-line
        this.answers = this.questions.map((question) => eval(question));
        this.p1Score = 0;
        this.p2Score = 0;
    }

    // Receive the data and send it to both
    dataRecieved(player: ConnectionManager, data: any): void {
        console.log(data)
        if (data.dataReady !== undefined) {
            player?.replyDataFromEngine({
                setQuestionsAndAnswers: true,
                questions: this.questions,
                answers: this.answers,
            });
        }
        if (data.p1Score !== undefined) {
            if (player.player1) {
                this.p1Score = data.p1Score + 1;
            } else {
                this.p2Score = data.p2Score + 1;
            }
            this.checkForWinner();
            this.player1.replyDataFromEngine({
                updatePlayerScores: true,
                p1Score: this.p1Score,
                p2Score: this.p2Score,
            });
            this.player2.replyDataFromEngine({
                updatePlayerScores: true,
                p1Score: this.p1Score,
                p2Score: this.p2Score,
            });
        }
    }

    // Check if someone has won
    checkForWinner() {
        if (this.p1Score === 5) {
            this.engine.playerOneWin();
        }
        if (this.p2Score === 5) {
            this.engine.playerTwoWin();
        }
    }

    // Generate 5 questions
    createQuestionList() {
        const operators = ["+", "-", "*"];
        const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

        for (let i = 0; i < 5; i++) {
            var question = numbers[Math.floor(Math.random() * 10)] + operators[Math.floor(Math.random() * 3)] + numbers[Math.floor(Math.random() * 10)];
            this.questions.push(question);
        }
    }
}
