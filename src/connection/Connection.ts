import ListenableObject from "../ListenableObject";

export default class Connection {

  readonly socket = new WebSocket("wss://sleepy-tor-99367.herokuapp.com");
  readonly name = new ListenableObject<string>("")

  readonly onDataRecievedListeners = new Set<(data: any) => void>()

  constructor() {
    this.socket.onmessage = e => {
      const js = JSON.parse(e.data)
      if (js._heartbeat !== undefined) {
        this.socket.send(JSON.stringify({ _heartbeat: Date.now() }))
        return
      }
      if (js.setName !== undefined) {
        this.name.value = js.setName
        return
      }
      this.onDataRecievedListeners.forEach(d => d(js))
    }
    this.socket.onclose = () => {
      var params = new URLSearchParams(window.location.search);
      params.set('disconnected', 'true');
      window.location.search = params.toString();
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

