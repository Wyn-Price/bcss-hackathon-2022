import { useEffect, useMemo, useRef, useState } from 'react';
import TypeToEachOtherGame from './minigames/TypeToEachOtherGame';
import { ConnectionManager, createHostManager, createRemoteGameListener, createRemoteManager } from './connection/ConnectionManager';
import GameEngine from './connection/GameEngine';
import Connection from './connection/Connection';
import { useListenableObject } from './ListenableObject';
import { stat } from 'fs';
import { ReplyToEachotherMinigame } from './minigames/Minigame';

const defaultState = "none"


const App = () => {
  const connection = useMemo(() => new Connection(), [])

  const [state, setState] = useState<"none" | "host-wait" | "play">(defaultState)
  const [joinCode, setJoinCode] = useState("")
  const [connectionManager, setConnectionManager] = useState<ConnectionManager>()
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

  console.log(state)

  if (state === "none") {
    return (
      <div className='flex w-full h-full justify-center items-center'>
        <div className='flex flex-col p-10 bg-gray-500'>
          <button onClick={createRoom} className='p-2 m-2 bg-red-500'>Create</button>
          <div className='flex p-2 m-2 bg-red-500'>
            <input value={joinCode} onInput={e => setJoinCode(e.currentTarget.value)} placeholder='code' />
            <button onClick={joinRoom} className='ml-2'>Join</button>
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

  //For testing purposes:
  if (gameEngineRef.current && gameEngineRef.current.currentGame == null) {
    const ge = gameEngineRef.current
    ge.currentGame = new ReplyToEachotherMinigame(ge.player1, ge.player2)
  }

  return (
    <>
      <TypeToEachOtherGame connection={connectionManager} />
    </>
  );
}

const HostWaitForClientGame = ({ peer, startPlaying }: { peer: Connection, startPlaying: () => void }) => {
  const [name] = useListenableObject(peer.name)
  useEffect(() => {
    const remove = peer.onDataRecieved(data => {
      if (data.startGame === "main") {
        startPlaying()
        remove()
      }
    })
  }, [peer])

  return (
    <div>
      Waiting for player {name}
    </div>
  )
}

export default App;
