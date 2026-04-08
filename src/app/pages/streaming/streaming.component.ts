import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { StreamingService } from "@services/streaming.service";
import { StreamingConfigComponent } from "./components/config/config.component";

@Component({
  selector: "streaming",
  template: '<div class="max-w-50"><streaming-config /><router-outlet /></div>',
  imports: [RouterModule, StreamingConfigComponent],
  providers: [StreamingService],
})
export class StreamingPageComponent {
  private _streaming = inject(StreamingService);
}
