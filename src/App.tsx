import Peer from 'peerjs';
import { useEffect, useMemo, useState } from 'react';
import BattleShipsGame from './BattleShipsGame';
import { ConnectionManager } from './connection/Connection';


const defaultState = "none"

const App = () => {
  const peer = useMemo(() => new Peer({
    host: 'localhost',
    port: 9000
  }), [])

  const [state, setState] = useState<"none" | "host-wait" | "play">(defaultState)
  const [joinCode, setJoinCode] = useState("")
  const [connection, setConnection] = useState<ConnectionManager>()

  if (true) return <BattleShipsGame />


  const createRoom = () => {
    setState("host-wait")
  }

  const joinRoom = () => {
    setState("play")
    peer.connect(joinCode)
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

  if (state === "host-wait") {

  }



  return (
    <>
      <BattleShipsGame />
    </>
  );
}

const HostWaitForClientGame = ({ peer, other, setOther }: { peer: Peer, other: Peer.DataConnection | undefined, setOther: (data: Peer.DataConnection) => void }) => {
  useEffect(() => { peer.on("connection", setOther) }, [peer])

  if (other === undefined) return (
    <div>Waiting For Connection {peer.id}</div>
  )

  return (
    <div>Connected With {other.peer}</div>
  )
}

export default App;
