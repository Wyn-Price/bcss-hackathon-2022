import { SVGProps, useCallback, useEffect, useRef, useState } from "react";
import sun from './assets/sun.png';
import waves from './assets/waves.png';
import { BattleShipsGame } from "./battleship/BattleShipGame";
import Connection from "./connection/Connection";
import { ConnectionManager, ConnectionManagerPlayer, createHostManager, createRemoteGameListener, createRemoteManager } from "./connection/ConnectionManager";
import GameEngine from "./connection/GameEngine";
import LoseScreen from "./EndScreens/LoseScreen";
import WinScreen from "./EndScreens/WinScreen";
import { useListenableObject } from "./ListenableObject";
import { minigames, MinigameScreens } from "./MiniGames/MinigameData";

const defaultState = "none";

const locations = new URLSearchParams(window.location.search);
window.history.pushState({}, document.title, window.location.pathname);
const wasDisconncted = locations.get("disconnected") === "true";

const connection = new Connection();

const App = () => {
  const [state, setState] = useState<"none" | "host-wait" | "play">(defaultState);
  const [joinCode, setJoinCode] = useState("");
  const [connectionManager, setConnectionManager] = useState<ConnectionManagerPlayer>();
  const gameEngineRef = useRef<GameEngine>();

  const playerJoinedThis = useCallback(() => {
    gameEngineRef.current = new GameEngine();
    const conn = createHostManager(gameEngineRef.current);
    setConnectionManager(conn);
    gameEngineRef.current.playerOneConnect(conn);
    gameEngineRef.current.otherPlayerConnect(createRemoteManager(connection, gameEngineRef.current));
    setState("play");
  }, [])

  const createRoom = () => {
    setState("host-wait");
  };

  const joinRoom = () => {
    connection.send({
      connectToName: joinCode,
    });
    const remove = connection.onDataRecieved((data) => {
      if (data.startGame === "main") {
        remove();
        console.log("on_opened");
        setConnectionManager(createRemoteGameListener(connection));
        setState("play");
      }
    });
  };

  const wavesRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (wavesRef.current) {
      wavesRef.current.style.marginTop = "1200px"
    }
  }, [])



  if (state === "none") {
    return (
      <div className="flex flex-col absolute w-full h-full justify-center bg-blue-300 items-center overflow-hidden">
        <div className="pointer-events-none animate-spin duration-75 absolute h-40 w-40 top-0 right-0 p-2">
          <img className='object-contain' src={sun} alt="cannot find" />
        </div>
        <h1 className="absolute top-6 font-bold text-gray-600 text-5xl">SUPER</h1>
        <h1 className="absolute top-14 font-bold text-9xl">BATTLESHIP</h1>
        <h1 className="absolute top-44 font-bold text-secondary text-5xl">PARTY</h1>
        <div className="flex flex-col p-10 rounded-md ">
          <button onClick={createRoom} className="font-bold p-2 m-2 rounded-md bg-secondary">
            Create Game
          </button>
          <div className="flex p-2 m-2 rounded-md bg-secondary">
            <input className="pl-2 rounded" value={joinCode} onInput={(e) => setJoinCode(e.currentTarget.value)} placeholder="Code" />
            <button onClick={joinRoom} className="font-bold ml-2">
              Join Game
            </button>
          </div>
          <div>{wasDisconncted ? "Error: Socket Disconnected" : ""}</div>
        </div>
        <div ref={wavesRef} className="pointer-events-none absolute w-screen transition-all duration-1000">
          <img className='object-fill w-full' src={waves} alt="cannot find" />
        </div>

      </div>
    );
  }

  if (state === "host-wait") {
    return <HostWaitForClientGame peer={connection} startPlaying={playerJoinedThis} />;
  }

  if (connectionManager === undefined) {
    return <div>Connection is undefined, but we're playing?</div>;
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
};

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
  const [minigame, setMinigame] = useState<typeof minigames[number] | null>(null);
  const [minigameWinLoose, setMinigameWinLoose] = useState<"winner" | "looser">()
  const [gameOver, setGameOver] = useState<"winner" | "loser">();

  const [timesResetHack, setTimesResetHack] = useState(0);

  useEffect(() =>
    conn.subscribeToDataRecieved((data) => {
      if (data.isInternalMessage === true) {
        if (data.gameOverIsWinner !== undefined) {
          setGameOver(data.gameOverIsWinner ? "winner" : "loser");
          setMinigame(null);
        }
        if (data.reset === true) {
          setGameOver(undefined);
          conn.reset();
          setTimesResetHack(timesResetHack + 1);
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
          const tileSet = data.self ? conn.playerState.myTiles : conn.playerState.otherTiles;
          tileSet[data.grid.x][data.grid.y] = data.newTile;

          //Only change turns when the game is either lost, or the it's a miss
          const didPlayerWhoseTurnItWasWin = conn.playerState.isSelfTurn.value === data.self;
          if (didPlayerWhoseTurnItWasWin || data.newTile !== "fire_hit") {
            conn.playerState.isSelfTurn.value = !conn.playerState.isSelfTurn.value;
          }
          setMinigameWinLoose(data.self ? "looser" : "winner")
          setMinigame(null);
        }
        if (data.startMinigame !== undefined) {
          setMinigame(data.startMinigame);
        }
      }
    }, true),
    [conn, timesResetHack]
  );
  if (minigameWinLoose !== undefined) {
    setTimeout(setMinigameWinLoose, 1500)
    return (
      <div className={'flex flex-col items-center justify-center h-full p-10 ' + (minigameWinLoose === "winner" ? "bg-green-400" : "bg-red-400")}>
        <div className='text-4xl p-2 my-2 font-bold'>{minigameWinLoose === "winner" ? "You Won" : "You Lost"}</div>
      </div>
    )
  }
  if (gameOver !== undefined) {
    const playAgain = () => {
      conn.sendDataToEngine({ resetBothClients: true });
    };
    return gameOver === "winner" ? <WinScreen playAgain={playAgain} /> : <LoseScreen playAgain={playAgain} />;
  }
  if (minigame !== null) {
    return <MinigameScreen key={timesResetHack} minigame={minigame} conn={conn} />;
  }
  return (
    <>
      <BattleShips key={timesResetHack} conn={conn} />
    </>
  );
};

const MinigameScreen = ({ minigame, conn }: { minigame: typeof minigames[number]; conn: ConnectionManager }) => {
  const Screen = MinigameScreens[minigame];
  const hasSentDataReady = useRef(false)
  useEffect(() => {
    if (hasSentDataReady.current) {
      return
    }
    hasSentDataReady.current = true
    conn.sendDataToEngine({ dataReady: true });
  }, [conn]);
  return <Screen conn={conn} />;
};

const BattleShips = ({ conn }: { conn: ConnectionManagerPlayer }) => {
  return (
    <div className="flex flex-col w-full h-full bg-main pt-[100px]">
      {/* Battleships area. Click to start minigame:
      {minigames.map((mg) => (
        <div key={mg} onClick={() => conn.sendDataToEngine({ changeGameTo: mg })}>
          {mg}
        </div>
      ))} */}
      <BattleShipsGame connection={conn} />
    </div>
  );
};

const HostWaitForClientGame = ({ peer, startPlaying }: { peer: Connection; startPlaying: () => void }) => {
  const [name] = useListenableObject(peer.name);
  const hasStarted = useRef(false);
  useEffect(() => {
    const remove = peer.onDataRecieved((data) => {
      if (data.startGame === "main" && !hasStarted.current) {
        hasStarted.current = true;
        startPlaying();
        remove();
      }
    });
  }, [peer, startPlaying]);

  const [hasCopied, setHasCopied] = useState(false)

  return (
    <div className="h-full w-full flex items-center justify-center bg-main">
      <div className="w-fit bg-secondary rounded-lg p-5">
        <h2 className="text-3xl mb-10">Waiting for player to connect</h2>
        <div className="flex flex-row items-center mt-3">
          <span>Game Join Code:</span>
          <span className="ml-2 font-bold">{name}</span>
          <button className="w-8 h-8 ml-1 p-1" onClick={() => {
            navigator.clipboard.writeText(name)
            setHasCopied(true)
          }}>
            <CopyLinkIcon />
          </button>
        </div>
        <div className="h-5 text-sm text-blue-900">{hasCopied && "Copied"}</div>
      </div>
    </div>
  );

};


const CopyLinkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path d="M22 6v16h-16v-16h16zm2-2h-20v20h20v-20zm-24 17v-21h21v2h-19v19h-2z" />
    </svg>
  )
}

export default App;
