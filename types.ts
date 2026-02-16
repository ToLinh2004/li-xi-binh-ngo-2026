
export interface GameCard {
  id: number;
  value: string;
  amount: number;
  isOpened: boolean;
}

export interface GameState {
  cards: GameCard[];
  total: number;
  notes: string[];
  openedIndices: number[];
  isThinking: boolean;
  currentWish: string;
}
