import { Component, computed, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Match, Player } from "@interfaces/tournament";

@Component({
  selector: "tournament-mainbracket",
  imports: [CommonModule],
  templateUrl: "./mainbracket.component.html",
})
export class TournamentMainBracketComponent {
  matches = input.required<Match[]>();
  players = input.required<Player[]>();
  rounds = computed(() => {
    const grouped: { [key: number]: Match[] } = {};
    const upperBracket = this.matches().filter((m) => m.round > 0);
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
      }));
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
    return matches.slice(startIndex, endIndex);
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
