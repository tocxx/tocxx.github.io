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

interface Map {
  id: string;
  diff: number;
  category: number;
}

export interface Match {
  id: number;
  p1: MatchPlayer;
  p2: MatchPlayer;
  loser?: number;
  winner?: number;
}

interface MatchPlayer {
  id: number;
  name: string;
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
  | 'single elimination'
  | 'double elimination'
  | 'round robin'
  | 'swiss'
  | 'free for all';
