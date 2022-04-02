import React from 'react';
import '../stylesheets/index.css';
import firework from './Images/fireworks.png';


const WinScreen = ({ playAgain }: { playAgain: () => void }) => {
    return (
        <div className='flex flex-col items-center justify-center h-full bg-green-400 p-10'>
            <div className='text-4xl p-2 my-2 italic'>Congratulations Player</div>
            <div className='text-4xl p-2 my-2 font-bold'>You Win!</div>
            <img className='flex-shrink min-h-0' src={firework} alt="Cannot display" />
            <button onClick={playAgain} className='bg-blue-500 rounded p-2'>Play Again</button>
        </div>
    )
}
export default WinScreen;
