export interface TournamentObject {
  id: string;
  name: string;
  config: TournamentConfig;
  url: string;
  tournament_type: TournamentType;
}

export interface TournamentConfig {
  pools: Pool[];
  matches: Match[];
  players: Player[];
  rounds: Round[];
}

export interface Pool {
  matchIds: number[];
  maps: Map[];
}

export interface Map {
  id: string;
  metadata?: MapMetadata;
}

export interface MapMetadata {
  category: Category;
  difficulty: Difficulty;
  cover: string;
  artist: string;
  title: string;
  description: string;
}

interface Category {
  title: string;
  color: string;
}

interface Difficulty {
  title: string;
  color: string;
}

export interface Match {
  id: number;
  p1: number;
  p2: number;
  round: number;
  loser?: number;
  winner?: number;
}

export interface OngoingMatch {
  id: number;
  p1: {
    id: number;
    name: string;
    luid?: string;
  };
  p2: {
    id: number;
    name: string;
    luid?: string;
  };
  loser?: number;
  winner?: number;
  picks: Map[];
  bans: Map[];
}

export interface Player {
  id: number;
  name: string;
  seed: number;
  tournament_id: number;
  final_rank?: number;
}

export interface Round {
  id: number;
}

type TournamentType =
  | "single elimination"
  | "double elimination"
  | "round robin"
  | "swiss"
  | "free for all";

export interface LobbyPlayer {
  id: string;
  name: string;
}

export interface ScoreData {
  luid: string;
  accuracy: number;
  combo: number;
  missCount: number;
}
