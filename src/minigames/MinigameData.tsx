import { ConnectionManager } from "../connection/ConnectionManager"
import GameEngine from "../connection/GameEngine"
import Blackjack, { BlackjackMinigame } from "./Blackjack"
import { MathGame, MathMinigame } from "./MathGame"
import { Minigame } from "./Minigame"
import { ReactionTime, ReactionTimeMinigame } from "./ReactionTime"

export const minigames = ["reaction-time", "math-game", "blackjack"] as const

export const MinigameCreators: Record<typeof minigames[number], (gameEngine: GameEngine, p1?: ConnectionManager, p2?: ConnectionManager) => Minigame> = {
  "reaction-time": (ge, p1, p2) => new ReactionTimeMinigame(ge, p1, p2),
  "math-game": (ge, p1, p2) => new MathMinigame(ge, p1, p2),
  "blackjack": (ge, p1, p2) => new BlackjackMinigame(ge, p1, p2)
}

export const MinigameScreens: Record<typeof minigames[number], ({ conn }: { conn: ConnectionManager }) => JSX.Element> = {
  "reaction-time": ({ conn }) => <ReactionTime connection={conn} />,
  "math-game": ({ conn }) => <MathGame connection={conn} />,
  "blackjack": ({ conn }) => <Blackjack connection={conn} />
}