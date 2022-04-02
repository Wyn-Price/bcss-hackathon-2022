import { ConnectionManager } from "../connection/ConnectionManager"
import GameEngine from "../connection/GameEngine"
import { Minigame } from "./Minigame"
import { ReactionTime, ReactionTimeMinigame } from "./ReactionTime"

export const minigames = ["reaction-time"] as const

export const MinigameCreators: Record<typeof minigames[number], (gameEngine: GameEngine, p1?: ConnectionManager, p2?: ConnectionManager) => Minigame> = {
  "reaction-time": (ge, p1, p2) => new ReactionTimeMinigame(ge, p1, p2)
}

export const MinigameScreens: Record<typeof minigames[number], ({ conn }: { conn: ConnectionManager }) => JSX.Element> = {
  "reaction-time": ({ conn }) => <ReactionTime connection={conn} />
}