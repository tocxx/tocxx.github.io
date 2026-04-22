import { Component, computed, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Match, Player, Pool } from "@interfaces/tournament";

@Component({
  selector: "tournament-losersbracket",
  imports: [CommonModule],
  templateUrl: "./losersbracket.component.html",
})
export class TournamentLosersBracketComponent {
  matches = input.required<Match[]>();
  players = input.required<Player[]>();
  pools = input.required<Pool[]>();
  rounds = computed(() => {
    const grouped: { [key: number]: Match[] } = {};
    const upperBracket = this.matches().filter((m) => m.round < 0);
    upperBracket.forEach((m) => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });
    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a)
      .map((r) => ({
        number: r,
        matches: grouped[r],
      }))
      .map((r) => {
        const poolIndex = this.pools().findIndex((p) =>
          p.matchIds.includes(r.matches[0]?.id),
        );
        return {
          ...r,
          pool: poolIndex !== -1 ? poolIndex + 1 : null,
        };
      });
  });
  maxSlotsPerRound = computed(() => {
    let slots = 0;
    for (let r of this.rounds()) {
      if (r.matches.length > slots) slots = r.matches.length;
    }
    return slots;
  });
  loserOfs: Record<number, { p1: number; p2?: number }> = {
    22: { p1: 15, p2: 1 },
    21: { p1: 13, p2: 2 },
    20: { p1: 12, p2: 3 },
    19: { p1: 11, p2: 4 },
    18: { p1: 10, p2: 5 },
    16: { p1: 8, p2: 6 },
    17: { p1: 9, p2: 7 },
    26: { p1: 14, p2: undefined },
    32: { p1: 28, p2: undefined },
    31: { p1: 27, p2: undefined },
    34: { p1: 30, p2: undefined },
    33: { p1: 29, p2: undefined },
    40: { p1: 38, p2: undefined },
    39: { p1: 37, p2: undefined },
  };

  getPlayerName(match: Match, player: "p1" | "p2") {
    const id = player === "p1" ? match.p1 : match.p2;
    if (id) return this.players().find((p) => p.id === id)?.name || "Unknown";
    const loserOf = this.loserOfs[match.number];
    return loserOf
      ? loserOf[player]
        ? `Loser of ${loserOf[player]}`
        : undefined
      : undefined;
  }

  getSpacingMatches(match: Match) {
    const rounds = this.rounds();
    const matchIndex = rounds[0].matches.indexOf(match);
    if (matchIndex === 0) return [match];
    return [];
  }

  getEndingSpacingMatches() {
    const matches = this.rounds()[1].matches;
    let startIndex = 0;
    let endIndex = 0;
    for (let match of matches) {
      let index = matches.indexOf(match);
      if (!match.p1 || !match.p2) {
        if (index === matches.length - 1) return [];
        startIndex = index;
        endIndex = index;
      } else {
        endIndex++;
      }
    }
    return matches.slice(startIndex, endIndex);
  }
}
