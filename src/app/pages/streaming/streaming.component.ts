import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StreamingService } from '@services/streaming.service';

@Component({
  selector: 'streaming',
  template: '<router-outlet />',
  imports: [RouterModule],
  providers: [StreamingService],
})
export class StreamingPageComponent {
  private _streaming = inject(StreamingService);
}
