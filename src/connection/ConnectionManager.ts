import { useEffect } from 'react';
import Connection from './Connection';
import GameEngine from './GameEngine';


export interface ConnectionManager {
  player1: boolean,
  sendDataToEngine: (data: any) => void, //Sends data to engine
  replyDataFromEngine: (data: any) => void, //Reply from data in the engine, updates the listeners

  //Engine replies
  //Takes in a function, and returns a function that unsubscribes the data
  subscribeToDataRecieved: (func: (data: any) => void) => () => void
}

export const createHostManager = (gameEngine: GameEngine): ConnectionManager => {
  const listeners = new Set<(data: any) => void>()
  return {
    player1: true,
    sendDataToEngine(data) {
      gameEngine.dataRecieved(this, data)
    },
    replyDataFromEngine(data) {
      listeners.forEach(l => l(data))
    },
    subscribeToDataRecieved(func) {
      listeners.add(func)
      return () => { listeners.delete(func) }
    }
  }
}

export const createRemoteManager = (connection: Connection, gameEngine: GameEngine): ConnectionManager => {
  const listeners = new Set<(data: any) => void>()
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


export const createRemoteGameListener = (connection: Connection) => {
  const listeners = new Set<(data: any) => void>()
  connection.onDataRecieved(data => {
    listeners.forEach(listener => listener(data))
  })
  const player: ConnectionManager = {
    player1: false,
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
  return player
}

export const useDataRecieved = (conn: ConnectionManager, func: (data: any) => void) => {
  return useEffect(() => conn.subscribeToDataRecieved(data => {
    if (data.isInternalMessage === undefined) {
      func(data)
    }
  }), [conn])
}