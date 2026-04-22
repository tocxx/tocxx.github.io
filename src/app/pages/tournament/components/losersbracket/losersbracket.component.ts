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

  getPlayerName(match: Match, player: "p1" | "p2") {
    const id = player === "p1" ? match.p1 : match.p2;
    if (id) return this.players().find((p) => p.id === id)?.name || "Unknown";
    const text = [{ p1: 15, p2: 1 }];
    const rounds = this.rounds();
    const matchIndex = rounds[0].matches.indexOf(match);
    return undefined;
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
