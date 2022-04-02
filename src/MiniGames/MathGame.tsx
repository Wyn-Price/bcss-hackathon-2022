import React from 'react';
import '../stylesheets/index.css';



// const container = document.getElementById('root')
// if (!container) throw new Error("Missing root element")
// const root = ReactDOMClient.createRoot(container)





const MathGame = () => {

    let questions = createQuestionList()
    let answers = questions.map((question) => eval(question))

    const [currentQuestion, updateCurrentQuestion] = React.useState(0);
    const [score, incrementScore] = React.useState(0);



    const Question = () => { // { questions }: { questions: string[] }
        return (
            <div className='flex flex-col items-center justify-center bg-white rounded-2xl h-fit w-96'>
                <div className='flex'>
                    <header className='text-4xl font-bold'>{questions[currentQuestion]} =</header>
                    <header className='text-4xl text-red-700 font-bold'>?</header>
                </div>
                <Selections answer={answers[currentQuestion]}></Selections>
            </div>
        )
    }

    const Selections = ({ answer }: { answer: number }) => {

        var options: number[] = [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)]
        options.splice(Math.floor(Math.random() * 3), 0, answer)


        return (
            <div className='m-3 mt-5 bg-white'>
                {options.map((option) => <div className='flex items-center justify-center border-2 m-2 p-2 bg-white rounded-full'
                    onClick={() => CheckAnswer(option, answer)}>
                    <header className='text-3xl'>{option}</header>
                </div>)}
            </div>
        )

        function CheckAnswer(selected: number, answer: number) {
            if (selected == answer) {
                updateCurrentQuestion(currentQuestion + 1)
                incrementScore(score + 1);
                if (score + 1 == 5) {
                    alert("you win")
                    incrementScore(score + 1);
                }
            }
        }


    }



    return (
        <div className='h-screen flex bg-purple-600 justify-evenly'>
            <div className='flex w-1/4 items-center justify-center'>
                <header className='text-4xl text-white'>Player 1 Score: 0</header>
            </div>

            <div className='flex flex-col items-center justify-center w-1/2'>
                <Question></Question>
            </div>

            <div className='flex w-1/4 items-center justify-center'>
                <header className='text-4xl text-white'>Player 2 Score: {score}</header>
            </div>
            {/* {questions.map((question) => <div>{question}</div>)} */}
        </div>


    )
}

// Generate 5 questions
function createQuestionList() {
    const operators = ["+", "-", "*"]
    const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    let questions: string[] = []

    for (let i = 0; i < 5; i++) {
        var question = numbers[Math.floor(Math.random() * 10)]
            + operators[Math.floor(Math.random() * 3)]
            + numbers[Math.floor(Math.random() * 10)]
        questions.push(question)
    }


    return questions
}

export default MathGame;
