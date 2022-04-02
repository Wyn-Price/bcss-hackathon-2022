import Peer from 'peerjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import BattleShipsGame from './BattleShipsGame';
import { ConnectionManager, createHostManager, createRemoteManager } from './connection/Connection';
import GameEngine from './connection/GameEngine';


const defaultState = "none"

const App = () => {
  const peer = useMemo(() => new Peer({
    host: 'localhost',
    port: 9000
  }), [])

  const [state, setState] = useState<"none" | "host-wait" | "play">(defaultState)
  const [joinCode, setJoinCode] = useState("")
  const [connection, setConnection] = useState<ConnectionManager>()
  const gameEngineRef = useRef<GameEngine>()


  const createRoom = () => {
    gameEngineRef.current = new GameEngine()
    const conn = createHostManager(gameEngineRef.current)
    setConnection(conn)
    gameEngineRef.current.playerOneConnect(conn)
    setState("host-wait")
  }

  const joinRoom = () => {
    const dataConnection = peer.connect(joinCode)
    setConnection(createRemoteManager(dataConnection))
    setState("play")
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
        </div>
      </div>
    )
  }

  if (state === "host-wait" && gameEngineRef.current !== undefined) {
    return <HostWaitForClientGame peer={peer} gameEngine={gameEngineRef.current} startPlaying={() => setState("play")} />
  }

  if (connection === undefined) {
    return <div>Connection is undefined, but we're playing?</div>
  }



  return (
    <>
      {/* <BattleShipsGame connection={connection} /> */}
    </>
  );
}

const HostWaitForClientGame = ({ peer, gameEngine, startPlaying }: { peer: Peer, gameEngine: GameEngine, startPlaying: () => void }) => {
  const hasRecievedRef = useRef(false)
  useEffect(() => {
    peer.on("connection", connection => {
      if (hasRecievedRef.current) {
        return
      }
      hasRecievedRef.current = true
      gameEngine.otherPlayerConnect(createRemoteManager(connection))
      startPlaying()
    })
  }, [peer])

  return (
    <div>
      Waiting for player {peer.id}
    </div>
  )
}

export default App;
