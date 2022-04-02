import React from 'react';
import '../stylesheets/index.css';

// const container = document.getElementById('root')
// if (!container) throw new Error("Missing root element")
// const root = ReactDOMClient.createRoot(container)

const WinScreen = () => {
    const playerID = 2; // Temp winnerID
    return (
        <div className='flex flex-col items-center justify-center h-screen bg-green-400'>
            <header className='text-4xl p-2 my-2 italic'>Congratulations Player {playerID}</header>
            <header className='text-4xl p-2 my-2 font-bold'>You Win!</header>

        </div>
    )
}
export default WinScreen;
