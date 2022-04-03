import { ConnectionManager } from "../connection/ConnectionManager"
import GameEngine from "../connection/GameEngine"
import Blackjack, { BlackjackMinigame } from "./Blackjack"
import { MathGame, MathMinigame } from "./MathGame"
import { Minigame } from "./Minigame"
import NaughtsAndCrosses, { NaughtsAndCrossesMinigame } from "./NaughtsAndCrosses"
import { ReactionTime, ReactionTimeMinigame } from "./ReactionTime"
import RockPaperScissors, { RPSMinigame } from "./RockPaperScissors"
import { SimonSays, SimonSaysMinigame } from "./SimonSays"

export const minigames = ["reaction-time", "math-game", "blackjack", "naughts-crosses", "rock-paper-scissors", "simon-says"] as const


export const MinigameCreators: Record<typeof minigames[number], (gameEngine: GameEngine, p1: ConnectionManager | undefined, p2: ConnectionManager | undefined, player1Fired: boolean) => Minigame> = {
  "reaction-time": (ge, p1, p2) => new ReactionTimeMinigame(ge, p1, p2),
  "math-game": (ge, p1, p2) => new MathMinigame(ge, p1, p2),
  "blackjack": (ge, p1, p2) => new BlackjackMinigame(ge, p1, p2),
  "naughts-crosses": (ge, p1, p2, p1f) => new NaughtsAndCrossesMinigame(ge, p1, p2, p1f),
  "rock-paper-scissors": (ge, p1, p2) => new RPSMinigame(ge, p1, p2),
  "simon-says": (ge, p1, p2) => new SimonSaysMinigame(ge, p1, p2)
}

export const MinigameScreens: Record<typeof minigames[number], ({ conn }: { conn: ConnectionManager }) => JSX.Element> = {
  "reaction-time": ({ conn }) => <ReactionTime connection={conn} />,
  "math-game": ({ conn }) => <MathGame connection={conn} />,
  "blackjack": ({ conn }) => <Blackjack connection={conn} />,
  "naughts-crosses": ({ conn }) => <NaughtsAndCrosses connection={conn} />,
  "rock-paper-scissors": ({ conn }) => <RockPaperScissors connection={conn} />,
  "simon-says": ({ conn }) => <SimonSays connection={conn} />
}
