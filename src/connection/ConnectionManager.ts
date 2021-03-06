import { PlayerGameState } from './BattleShipsGameData';
import { useEffect } from 'react';
import Connection from './Connection';
import GameEngine from './GameEngine';

export interface ConnectionManager {
  player1: boolean,
  sendDataToEngine: (data: any) => void, //Sends data to engine
  replyDataFromEngine: (data: any) => void, //Reply from data in the engine, updates the listeners

  //Engine replies
  //Takes in a function, and returns a function that unsubscribes the data
  subscribeToDataRecieved: (func: (data: any) => void, debug?: boolean) => () => void
}

export type GameState = "placing_tiles" | "play_game"


export type ConnectionManagerPlayer = ConnectionManager & {
  playerState: PlayerGameState
  reset: () => void
}


export const createHostManager = (gameEngine: GameEngine): ConnectionManagerPlayer => {
  const listeners = new Set<(data: any) => void>()
  let playerState = new PlayerGameState()
  return {
    player1: true,
    get playerState() {
      return playerState
    },
    reset: () => playerState = new PlayerGameState(),
    sendDataToEngine(data) {
      gameEngine.dataRecieved(this, data)
    },
    replyDataFromEngine(data) {
      listeners.forEach(l => l(data))
    },
    subscribeToDataRecieved(func) {
      listeners.add(func)
      return () => {
        listeners.delete(func);
      }
    }
  }
}

export const createRemoteManager = (connection: Connection, gameEngine: GameEngine): ConnectionManager => {
  connection.onDataRecieved(data => {
    gameEngine?.dataRecieved(player, data)
  })
  const player: ConnectionManager = {
    player1: false,
    sendDataToEngine(data) {
      throw new Error("Tried to send data from host side. Please use replyData")
    },
    replyDataFromEngine(data) {
      connection.send(data)
    },
    subscribeToDataRecieved(func) {
      return () => { }
      // throw new Error("Tried to subscribe to host side remote")
    }
  }
  return player
}


export const createRemoteGameListener = (connection: Connection): ConnectionManagerPlayer => {
  const listeners = new Set<(data: any) => void>()
  let playerState = new PlayerGameState()
  connection.onDataRecieved(data => {
    listeners.forEach(listener => listener(data))
  })
  return {
    player1: false,
    get playerState() {
      return playerState
    },
    reset: () => playerState = new PlayerGameState(),
    sendDataToEngine(data) {
      connection.send(data)
    },
    replyDataFromEngine(data) {
      throw new Error("Tried to reply to data from other side")
    },
    subscribeToDataRecieved(func) {
      listeners.add(func)
      return () => { listeners.delete(func) }
    }
  }
}

export const useDataRecieved = (conn: ConnectionManager, func: (data: any) => void) => {
  return useEffect(() => conn.subscribeToDataRecieved(data => {
    if (data.isInternalMessage === undefined) {
      func(data)
    }
  }), [conn, func])
}