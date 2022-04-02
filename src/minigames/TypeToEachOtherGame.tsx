import { useEffect, useState } from "react"
import { ConnectionManager } from "../connection/ConnectionManager"

const TypeToEachOtherGame = ({ connection }: { connection: ConnectionManager }) => {
  const [lines, setLines] = useState<readonly string[]>([])
  useEffect(() => connection.subscribeToDataRecieved(data => {
    setLines(curr => curr.concat(data.text))
  }), [connection])

  const [linesInput, setLinesInput] = useState("")
  const onClick = () => {
    setLinesInput("")
    connection.sendDataToEngine({ input: linesInput })
  }
  return (
    <div>
      <div>
        {lines.map((line, index) => <div key={index}>{line}</div>)}
      </div>
      <div>
        <input value={linesInput} onInput={e => setLinesInput(e.currentTarget.value)} />
        <button onClick={onClick}>Submit</button>
      </div>
    </div>
  )
}

export default TypeToEachOtherGame