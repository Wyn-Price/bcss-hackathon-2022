import { DataConnection } from 'peerjs';
import GameEngine from './GameEngine';
export interface ConnectionManager {
  sendData: (data: any) => void
}

export const createHostManager = (gameEngine: GameEngine): ConnectionManager => {
  return {
    sendData(data) {
      console.log(data)
    }
  }
}

export const createRemoteManager = (connection: DataConnection): ConnectionManager => {
  return {
    sendData(data) {
      connection.send(data)
    }
  }
}
