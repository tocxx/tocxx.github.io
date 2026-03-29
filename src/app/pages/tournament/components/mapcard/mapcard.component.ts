import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Map } from '@interfaces/tournament';

@Component({
  selector: 'tournament-mapcard',
  imports: [CommonModule],
  templateUrl: './mapcard.component.html',
})
export class TournamentMapcardComponent {
  @Input({ required: true }) map!: Map;
}
