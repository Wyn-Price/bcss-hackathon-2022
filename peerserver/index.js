import { PeerServer } from "peer";
import getName from "./english_words.js";

PeerServer({ port: 9000, path: '/', generateClientId: getName });