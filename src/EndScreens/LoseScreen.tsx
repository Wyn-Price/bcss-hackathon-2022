import React from 'react';
import '../stylesheets/index.css';

// const container = document.getElementById('root')
// if (!container) throw new Error("Missing root element")
// const root = ReactDOMClient.createRoot(container)

const LoseScreen = () => {
    const playerID = 1; // Temp loserID --> requests from server and then server passes in the loser
    return (
        <div className='flex flex-col items-center justify-center h-screen bg-red-700'>
            <header className='text-4xl p-2 my-2 italic'>Unlucky Player {playerID}</header>
            <header className='text-4xl p-2 my-2 font-bold'>L L L L L L!</header>

        </div>
    )
}
export default LoseScreen;
