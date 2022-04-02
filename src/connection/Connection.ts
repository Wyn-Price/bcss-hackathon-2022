export interface ConnectionManager {
  subscribe: (func: (text: string) => void) => void
  sendText: (text: string) => void
}