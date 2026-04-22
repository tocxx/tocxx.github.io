import { Component, computed, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Match, Player, Pool } from "@interfaces/tournament";

@Component({
  selector: "tournament-mainbracket",
  imports: [CommonModule],
  templateUrl: "./mainbracket.component.html",
})
export class TournamentMainBracketComponent {
  matches = input.required<Match[]>();
  players = input.required<Player[]>();
  pools = input.required<Pool[]>();
  rounds = computed(() => {
    const grouped: { [key: number]: Match[] } = {};
    const upperBracket = this.matches().filter(
      (m) => m.round > 0 && m.round < 6,
    );
    upperBracket.forEach((m) => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });
    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
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

  getPlayerName(id: number | undefined) {
    if (!id) return undefined;
    return this.players().find((p) => p.id === id)?.name || "Unknown";
  }

  getSpacingMatches(match: Match) {
    const rounds = this.rounds();
    const matchIndex = rounds[0].matches.indexOf(match);
    if (matchIndex === 0) return [];
    const matches = rounds[1].matches;
    const potentialNextMatches = matches.filter((m) => !m.p1 || !m.p2);
    const startIndex =
      matches.indexOf(potentialNextMatches[matchIndex - 1]) + 1;
    const endIndex = matches.indexOf(potentialNextMatches[matchIndex]);
    const spacingMatches = matches.slice(startIndex, endIndex);
    if (match.winner) spacingMatches.pop();
    return spacingMatches;
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
    console.log(matches.slice(startIndex, endIndex));
    return matches.slice(startIndex, endIndex);
  }
}
