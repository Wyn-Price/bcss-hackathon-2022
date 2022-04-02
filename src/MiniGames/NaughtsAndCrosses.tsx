import React from 'react';
import '../stylesheets/index.css';



// const container = document.getElementById('root')
// if (!container) throw new Error("Missing root element")
// const root = ReactDOMClient.createRoot(container)

const NaughtsAndCrosses = () => {

    const y = 96
    return (
        <div id="container" className='h-full'>
            <div className='flex h-screen items-center justify-center bg-green-500'>
                <div className='grid grid-rows-3 grid-cols-3 gap-4 h-96 w-96 bg-blue-500 p-1'>

                    <div className='bg-white'></div>
                    <div className='bg-white'></div>
                    <div className='bg-white'></div>

                    <div className='bg-white'></div>
                    <div className='bg-white'></div>
                    <div className='bg-white'></div>

                    <div className='bg-white'></div>
                    <div className='bg-white'></div>
                    <div className='bg-white'></div>


                </div>
            </div>
        </div >
    )
}

const playMove = (shape: string) => {
    return (
        shape
    )
}
export default NaughtsAndCrosses;
