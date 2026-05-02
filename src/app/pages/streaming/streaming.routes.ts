import { Routes } from "@angular/router";
import { StreamingPageComponent } from "./streaming.component";
import { StreamingPoolComponent } from "./components/pool/pool.component";
import { StreamingBracketComponent } from "./components/bracket/bracket.component";
import { StreamingPicksBansComponent } from "./components/picksbans/picksbans.component";
import { StreamingNextComponent } from "./components/next/next.component";
import { StreamingDetailsComponent } from "./components/details/details.component";
import { StreamingPlayComponent } from "./components/play/play.component";
import { StreamingResultComponent } from "./components/result/result.component";
import { StreamingDashboardComponent } from "./components/dashboard/dashboard.component";

export const routes: Routes = [
  {
    path: "",
    component: StreamingPageComponent,
    children: [
      {
        path: "pool/:id",
        component: StreamingPoolComponent,
      },
      {
        path: "bracket/:type",
        component: StreamingBracketComponent,
      },
      {
        path: "match/pb",
        component: StreamingPicksBansComponent,
      },
      {
        path: "match/next",
        component: StreamingNextComponent,
      },
      {
        path: "match/details",
        component: StreamingDetailsComponent,
      },
      {
        path: "match/play",
        component: StreamingPlayComponent,
      },
      {
        path: "match/result",
        component: StreamingResultComponent,
      },
      {
        path: "dashboard",
        component: StreamingDashboardComponent,
      },
    ],
  },
];
