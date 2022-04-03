import { useEffect, useRef, useState } from 'react';
import { BattleShipsGame } from './battleship/BattleShipGame';
import Connection from './connection/Connection';
import { ConnectionManager, ConnectionManagerPlayer, createHostManager, createRemoteGameListener, createRemoteManager } from './connection/ConnectionManager';
import GameEngine from './connection/GameEngine';
import LoseScreen from './EndScreens/LoseScreen';
import WinScreen from './EndScreens/WinScreen';
import { useListenableObject } from './ListenableObject';
import { minigames, MinigameScreens } from './MiniGames/MinigameData';

const defaultState = "none"

const locations = new URLSearchParams(window.location.search)
window.history.pushState({}, document.title, window.location.pathname);
const wasDisconncted = locations.get("disconnected") === "true"

const connection = new Connection()

const App = () => {
  const [state, setState] = useState<"none" | "host-wait" | "play">(defaultState)
  const [joinCode, setJoinCode] = useState("")
  const [connectionManager, setConnectionManager] = useState<ConnectionManagerPlayer>()
  const gameEngineRef = useRef<GameEngine>()

  const playerJoinedThis = () => {
    gameEngineRef.current = new GameEngine()
    const conn = createHostManager(gameEngineRef.current)
    setConnectionManager(conn)
    gameEngineRef.current.playerOneConnect(conn)
    gameEngineRef.current.otherPlayerConnect(createRemoteManager(connection, gameEngineRef.current))
    setState("play")
  }

  const createRoom = () => {
    setState("host-wait")
  }

  const joinRoom = () => {
    connection.send({
      connectToName: joinCode
    })
    const remove = connection.onDataRecieved(data => {
      if (data.startGame === "main") {
        remove()
        console.log("on_opened")
        setConnectionManager(createRemoteGameListener(connection))
        setState("play")
      }
    })
  }


  if (state === "none") {
    return (
      <div className='flex w-full h-full justify-center items-center'>
        <div className='flex flex-col p-10 bg-gray-500'>
          <button onClick={createRoom} className='p-2 m-2 bg-red-500'>Create</button>
          <div className='flex p-2 m-2 bg-red-500'>
            <input value={joinCode} onInput={e => setJoinCode(e.currentTarget.value)} placeholder='code' />
            <button onClick={joinRoom} className='ml-2'>Join</button>
          </div>
          <div>
            {wasDisconncted ? "Error: Socket Disconnected" : ""}
          </div>
        </div>
      </div>
    )
  }

  if (state === "host-wait") {
    return <HostWaitForClientGame peer={connection} startPlaying={playerJoinedThis} />
  }

  if (connectionManager === undefined) {
    return <div>Connection is undefined, but we're playing?</div>
  }

  // //For testing purposes:
  // if (gameEngineRef.current && gameEngineRef.current.currentGame == null) {
  //   const ge = gameEngineRef.current
  //   ge.currentGame = new ReplyToEachotherMinigame(ge.player1, ge.player2)
  // }

  return (
    <>
      <GameArea conn={connectionManager} />
      {/* <TypeToEachOtherGame connection={connectionManager} /> */}
    </>
  );
}

// type GameType = {
//   setMinigame: (game: typeof minigames[number]) => void
//   endMinigame: () => void
// }
// const GameContext = createContext<GameType | null>(null)
// const useGameContext = () => {
//   const context = useContext(GameContext)
//   if (context === null) throw new Error("useGameContext must be called between providers");
//   return context
// }
const GameArea = ({ conn }: { conn: ConnectionManagerPlayer }) => {
  const [minigame, setMinigame] = useState<typeof minigames[number] | null>(null)
  const [gameOver, setGameOver] = useState<"winner" | "loser">()

  const [timesResetHack, setTimesResetHack] = useState(0)

  useEffect(() => conn.subscribeToDataRecieved(data => {
    if (data.isInternalMessage === true) {
      if (data.gameOverIsWinner !== undefined) {
        setGameOver(data.gameOverIsWinner ? "winner" : "loser")
        setMinigame(null)
      }
      if (data.reset === true) {
        setGameOver(undefined)
        conn.reset()
        setTimesResetHack(timesResetHack + 1)
      }
      if (data.endMinigame === true) {
        //   {
        //     grid: {
        //         x: number;
        //         y: number;
        //     };
        //     newTile: "fire_miss" | "fire_hit";
        //     self: boolean;
        // }
        const tileSet = data.self ? conn.playerState.myTiles : conn.playerState.otherTiles
        tileSet[data.grid.x][data.grid.y] = data.newTile

        //Only change turns when the game is either lost, or the it's a miss
        const didPlayerWhoseTurnItWasWin = conn.playerState.isSelfTurn.value === data.self
        if (didPlayerWhoseTurnItWasWin || data.newTile !== "fire_hit") {
          conn.playerState.isSelfTurn.value = !conn.playerState.isSelfTurn.value
        }
        setMinigame(null)
      }
      if (data.startMinigame !== undefined) {
        setMinigame(data.startMinigame)
      }
    }
  }, true), [conn])
  if (gameOver !== undefined) {
    const playAgain = () => {
      conn.sendDataToEngine({ resetBothClients: true })
    }
    return gameOver === "winner" ? <WinScreen playAgain={playAgain} /> : <LoseScreen playAgain={playAgain} />
  }
  if (minigame !== null) {
    return <MinigameScreen key={timesResetHack} minigame={minigame} conn={conn} />
  }
  return (
    <>
      <BattleShips key={timesResetHack} conn={conn} />
    </ >
  )
}

const MinigameScreen = ({ minigame, conn }: { minigame: typeof minigames[number], conn: ConnectionManager }) => {
  const Screen = MinigameScreens[minigame]
  useEffect(() => {
    conn.sendDataToEngine({ dataReady: true })
  }, [])
  return (
    <Screen conn={conn} />
  )
}

const BattleShips = ({ conn }: { conn: ConnectionManagerPlayer }) => {
  return (
    <div className='flex flex-col w-full h-full'>
      Battleships area. Click to start minigame:
      {minigames.map(mg => (
        <div key={mg} onClick={() => conn.sendDataToEngine({ changeGameTo: mg })}>
          {mg}
        </div>
      ))}
      <BattleShipsGame connection={conn} />
    </div>
  )
}

const HostWaitForClientGame = ({ peer, startPlaying }: { peer: Connection, startPlaying: () => void }) => {
  const [name] = useListenableObject(peer.name)
  const hasStarted = useRef(false)
  useEffect(() => {
    const remove = peer.onDataRecieved(data => {
      if (data.startGame === "main" && !hasStarted.current) {
        hasStarted.current = true
        startPlaying()
        remove()
      }
    })
  }, [peer])

  return (
    <div>
      Waiting for player {name}
      <div className='bg-purple-600 w-10 ml-2' onClick={() => navigator.clipboard.writeText(name)}>Copy Link</div>
    </div>
  )
}

export default App;
