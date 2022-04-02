import Connection from './Connection';
import GameEngine from './GameEngine';


export interface ConnectionManager {
  player1: boolean,
  sendData: (data: any) => void, //Sends data to engine
  replyData: (data: any) => void, //Reply from data in the engine, updates the listeners

  //Engine replies
  //Takes in a function, and returns a function that unsubscribes the data
  subscribeToDataRecieved: (func: (data: any) => void) => () => void
}

export const createHostManager = (gameEngine: GameEngine): ConnectionManager => {
  const listeners = new Set<(data: any) => void>()
  return {
    player1: true,
    sendData(data) {
      gameEngine.dataRecieved(this, data)
    },
    replyData(data) {
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
    console.log("RECIEVE_DATA", data)
    gameEngine?.dataRecieved(player, data)

  })
  const player: ConnectionManager = {
    player1: false,
    sendData(data) {
      throw new Error("Tried to send data from host side. Please use replyData")
    },
    replyData(data) {
      console.trace("SEND_REPLY _DATA", data)
      connection.send(data)
    },
    subscribeToDataRecieved(func) {
      listeners.add(func)
      return () => { listeners.delete(func) }
    }
  }
  return player
}


export const createRemoteGameListener = (connection: Connection) => {
  const listeners = new Set<(data: any) => void>()
  connection.onDataRecieved(data => {
    console.log("RECIEVE_DATA", data)
    listeners.forEach(listener => listener(data))
  })
  const player: ConnectionManager = {
    player1: false,
    sendData(data) {
      console.trace("SEND_DATA", data)
      connection.send(data)
    },
    replyData(data) {
      throw new Error("Tried to reply to data from other side")
    },
    subscribeToDataRecieved(func) {
      listeners.add(func)
      return () => { listeners.delete(func) }
    }
  }
  return player
}