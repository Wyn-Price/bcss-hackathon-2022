import './SimonSays.css'
import ColorCard from './components/ColorCard';
import { useState, useEffect, useCallback } from "react"
import timeout from "./utils/util";
import { Minigame } from './Minigame';
import { ConnectionManager } from '../connection/ConnectionManager';

const listOfColors = ["green", "red", "yellow", "blue"];
/* initialPlay initialises all the states we need. It holds all the states we need when we're playing in real time */
const initialPlay = {
    isDisplay: false,
    colors: [] as string[],
    score: 0,
    userPlay: false,
    userColors: [] as string[],
}
export const SimonSays = ({ connection }: { connection: ConnectionManager }) => {

    //Setting the initial state of the button to be false. Later on, when we define the button, if it's clicked, we set it to true
    const [isOn, setIsOn] = useState(false); /* If we use 'useState' constantly, it becomes very difficult to manage each state. Therefore, we create variable called 'initialPlay' */

    const [play, setPlay] = useState(initialPlay);
    const [flashColor, setFlashColor] = useState("");

    /* This initiates the game (sets the state of the game to true) */
    function startHandle() {
        connection.sendDataToEngine({ setSimonSays: true })
        setIsOn(true);
    }

    useEffect(() => {
        if (isOn) {
            setPlay({ ...initialPlay, isDisplay: true });
        } else {
            setPlay(initialPlay);
        }
    }, [isOn]);

    useEffect(() => {
        if (isOn && play.isDisplay) { /* If the game is on and the display is on while playing */
            let newColor = listOfColors[Math.floor(Math.random() * 4)]; /* randomly selects a new color for the player to choose */

            const copyColors = [...play.colors];
            copyColors.push(newColor);
            setPlay({ ...play, colors: copyColors });
        }
        // eslint-disable-next-line
    }, [isOn, play.isDisplay]);

    const displayColors = useCallback(async () => {
        await timeout(300);
        for (let i = 0; i < play.colors.length; i++) {
            setFlashColor(play.colors[i]);
            await timeout(300);
            setFlashColor("");
            await timeout(300);

            if (i === play.colors.length - 1) {
                const copyColors = [...play.colors];
                setPlay({
                    ...play,
                    isDisplay: false,
                    userPlay: true,
                    userColors: copyColors.reverse(),
                });
            }
        }
    }, [play])

    useEffect(() => {
        if (isOn && play.isDisplay && play.colors.length) {
            displayColors();
        }
    }, [isOn, play.isDisplay, play.colors.length, displayColors])

    async function cardClickHandle(color: string) {
        if (!play.isDisplay && play.userPlay) {
            const copyUserColors = [...play.userColors];
            const lastColor = copyUserColors.pop();
            setFlashColor(color);

            if (color === lastColor) {
                if (copyUserColors.length) {
                    setPlay(play => ({ ...play, userColors: copyUserColors }));
                } else {
                    await timeout(300);
                    setPlay(play => ({
                        ...play,
                        isDisplay: true,
                        userPlay: false,
                        score: play.colors.length,
                        userColors: [],
                    }));
                }
                setPlay(play => ({ ...play, userColors: copyUserColors }))
            } else {
                connection.sendDataToEngine({ gameOver: true })
                // await timeout(300);
                // setPlay({...initialPlay, score:play.colors.length})
            }

            await timeout(300);
            setFlashColor("");
        }
    }

    function closeHandle() {
        setIsOn(false);
    }

    return (
        <div className='SimonSays'>
            <header className="SimonSays-header">
                <div className='cardWrapper'> {/* cardWrapper holds all the cards and the button*/}
                    {/* The list of colours are just the colours of the squares */}
                    {
                        listOfColors &&
                        listOfColors.map((v, i) => ( /* map function is used to iterate over the list of colors to create the initial state */
                            <ColorCard onClick={() => {
                                cardClickHandle(v);
                            }}
                                flash={flashColor === v}
                                color={v}></ColorCard>))
                    }
                </div>
                {isOn && !play.isDisplay && !play.userPlay && play.score && (
                    <div className="lost">
                        <div>Final Score: {play.score}</div>
                        <button onClick={closeHandle}>Close</button>
                    </div>
                )}
                {!isOn && !play.score && ( //If the start button has not been pressed and the player score has not been set
                    <button onClick={startHandle} className="startButton">Start</button>
                )}
                {isOn && (play.isDisplay || play.userPlay) && (
                    <div className="score">{play.score}</div>
                )}
            </header>
        </div>
    );
}

export class SimonSaysMinigame extends Minigame {

    dataRecieved(player: ConnectionManager, data: any): void {
        if (data.gameOver === true) {
            if (player.player1) {
                this.engine.playerTwoWin()
            } else {
                this.engine.playerOneWin()
            }
        }
        if (data.setSimonSays !== false) {
            if (player.player1) {

            }
        }
    }


}
