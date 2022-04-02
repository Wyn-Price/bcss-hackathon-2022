import React from 'react';
import { ConnectionManager, useDataRecieved } from '../connection/ConnectionManager';
import GameEngine from '../connection/GameEngine';
import '../stylesheets/index.css';
import { Minigame } from './Minigame';



// const container = document.getElementById('root')
// if (!container) throw new Error("Missing root element")
// const root = ReactDOMClient.createRoot(container)





// const MathGame = () => {

export const MathGame = ({ connection }: { connection: ConnectionManager }) => {


    const [currentQuestion, updateCurrentQuestion] = React.useState(0);
    const [p1Score, updateScore1] = React.useState(0);
    const [p2Score, updateScore2] = React.useState(0);

    const [questions, setQuestions] = React.useState([])
    const [answers, setAnswers] = React.useState([])

    const [winner, setWinner] = React.useState(undefined)


    useDataRecieved(connection, (data) => {
        setQuestions(data.questions)
        setAnswers(data.answers)
        updateScore1(data.p1Score)
        updateScore2(data.p2Score)
        setWinner(data.winner)
    })

    const Question = () => {
        if (winner == undefined) {
            return (
                <div className='flex flex-col items-center justify-center bg-white rounded-2xl h-fit w-96'>
                    <div className='flex'>
                        <header className='text-4xl font-bold'>{questions[currentQuestion]} =</header>
                        <header className='text-4xl text-red-700 font-bold'>?</header>
                    </div>
                    <Selections answer={answers[currentQuestion]}></Selections>
                </div>
            )
        } else {
            return (
                <div className='flex items-center justify-center h-48 w-96 mb-80'>
                    <header className='text-white text-6xl font-bold underline'>Player {winner} wins</header>
                </div>
            )
        }
    }

    // Sends the score to the server if there is ever an update
    const sendUpdatedScore = () => {
        connection.sendDataToEngine({ p1Score: p1Score, p2Score: p2Score });
    }

    const Selections = ({ answer }: { answer: number }) => {

        var options: number[] = [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)]
        options.splice(Math.floor(Math.random() * 3), 0, answer)

        let gameOver = false
        if (winner !== undefined) {
            gameOver = true
        }

        return (
            <div>
                <div className={(gameOver ? "hidden" : "") + ' m-3 mt-5 bg-white'}>

                    {options.map((option) => <div className='flex items-center justify-center border-2 m-2 p-2 bg-white rounded-full'
                        onClick={() => CheckAnswer(option, answer)}>
                        <header className='text-3xl'>{option}</header>
                    </div>)}
                </div>
            </div>
        )

        function CheckAnswer(selected: number, answer: number) {
            if (selected == answer) {
                updateCurrentQuestion(currentQuestion + 1)

                sendUpdatedScore()
            }
        }
    }


    return (
        <div className='h-screen flex bg-purple-600 justify-evenly'>
            <div className='flex w-1/4 items-center justify-center'>
                <header className='text-4xl text-white'>Player 1 Score: {p1Score}</header>
            </div>

            <div className='flex flex-col items-center justify-between w-1/2'>
                <div className='flex items-center h-1/6'>
                    <header className='flex items-center justify-center text-6xl'>QUICK MATHS</header>
                </div>
                <div className='flex items-center h-5/6'>
                    <Question></Question>
                </div>
            </div>

            <div className='flex w-1/4 items-center justify-center'>
                <header className='text-4xl text-white'>Player 2 Score: {p2Score}</header>
            </div>
        </div>

    )
}

export default MathGame;

export class MathMinigame extends Minigame {
    p1Score?: number
    p2Score?: number
    winner?: number

    questions: string[] = []
    answers: number[] = []

    constructor(gameEngine: GameEngine, player1?: ConnectionManager, player2?: ConnectionManager) {
        super(gameEngine, player1, player2)
        this.createQuestionList()
        this.answers = this.questions.map((question) => eval(question))
        this.p1Score = 0
        this.p2Score = 0
    }

    // Receive the data and send it to both
    dataRecieved(player: ConnectionManager, data: any): void {
        if (data.dataReady !== undefined) {
            player?.replyDataFromEngine({ questions: this.questions, answers: this.answers, p1Score: this.p1Score, p2Score: this.p2Score, winner: this.winner });
        }
        if (data.p1Score !== undefined) {
            if (player.player1) {
                this.p1Score = data.p1Score + 1
            } else {
                this.p2Score = data.p2Score + 1
            }
            this.checkForWinner()
            this.player1.replyDataFromEngine({ questions: this.questions, answers: this.answers, p1Score: this.p1Score, p2Score: this.p2Score, winner: this.winner });
            this.player2.replyDataFromEngine({ questions: this.questions, answers: this.answers, p1Score: this.p1Score, p2Score: this.p2Score, winner: this.winner });

        }

    }

    // Check if someone has won
    checkForWinner() {
        if (this.p1Score == 5) {
            this.winner = 1
        }
        if (this.p2Score == 5) {
            this.winner = 2
        }
    }

    // Generate 5 questions
    createQuestionList() {
        const operators = ["+", "-", "*"]
        const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

        for (let i = 0; i < 5; i++) {
            var question = numbers[Math.floor(Math.random() * 10)]
                + operators[Math.floor(Math.random() * 3)]
                + numbers[Math.floor(Math.random() * 10)]
            this.questions.push(question)
        }


    }
}
