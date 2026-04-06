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

  getPlayerName(id: number | undefined) {
    if (!id) return "TBD";
    return this.players().find((p) => p.id === id)?.name || "Unknown";
  }
}
