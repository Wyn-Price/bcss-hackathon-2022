import React from 'react';
import '../stylesheets/index.css';

// const container = document.getElementById('root')
// if (!container) throw new Error("Missing root element")
// const root = ReactDOMClient.createRoot(container)

const LoseScreen = ({ playAgain }: { playAgain: () => void }) => {
    return (
        <div className='flex flex-col items-center justify-center h-full bg-red-700'>
            <header className='text-4xl p-2 my-2 italic'>Unlucky Player</header>
            <header className='text-4xl p-2 my-2 font-bold'>L L L L L L!</header>
            <button onClick={playAgain} className='bg-blue-500 rounded p-2'>Play Again</button>

        </div>
    )
}
export default LoseScreen;
