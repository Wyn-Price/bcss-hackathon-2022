import express from 'express'
import getName from './english_words.js'
import WebSocket from "ws";
import expressWs from 'express-ws';

const app = express()
expressWs(app)
const port = 9000

// app.use(express.json({ limit: "50mb" }));

const unfound = {}

const nameToPeer = {}

app.ws('/', (ws, res) => {
  const name = getName()
  unfound[name] = ws
  ws.on('message', msg => {

    const js = JSON.parse(msg)
    console.log(js)
    if (js.connectToName !== undefined) {
      const other = js.connectToName
      console.log(`self=${name} pair-to=${other}`)
      if (nameToPeer[other] !== undefined) {
        return
      }
      if (unfound[other] !== undefined) {
        const connetedTo = unfound[other]
        delete unfound[other]
        delete unfound[name]

        console.log("pairing " + name + " with " + other)

        nameToPeer[name] = connetedTo
        nameToPeer[other] = ws

        ws.send(JSON.stringify({
          startGame: "main"
        }))
        connetedTo.send(JSON.stringify({
          startGame: "main"
        }))
      }
    } else if (nameToPeer[name] !== null) {
      nameToPeer[name].send(msg)
    }
  })
  ws.on("close", () => {
    console.log("close")
    //TODO: remove and close ws
  })
  ws.send(JSON.stringify({
    setName: name
  }))
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})