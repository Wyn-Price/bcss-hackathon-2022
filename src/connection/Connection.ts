import ListenableObject from "../ListenableObject";

export default class Connection {

  readonly socket = new WebSocket("ws://localhost:9000");
  readonly name = new ListenableObject<string>("")

  readonly onDataRecievedListeners = new Set<(data: any) => void>()

  constructor() {
    this.socket.onmessage = e => {
      const js = JSON.parse(e.data)
      if (js.setName !== undefined) {
        this.name.value = js.setName
        return
      }
      this.onDataRecievedListeners.forEach(d => d(js))
    }
  }

  send(data: any) {
    this.socket.send(JSON.stringify(data))
  }

  onDataRecieved(func: (data: any) => void) {
    this.onDataRecievedListeners.add(func)
    return () => {
      this.onDataRecievedListeners.delete(func)
    }
  }

}

