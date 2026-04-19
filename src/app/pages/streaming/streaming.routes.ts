import { Routes } from "@angular/router";
import { StreamingPageComponent } from "./streaming.component";
import { StreamingPoolComponent } from "./components/pool/pool.component";
import { StreamingBracketComponent } from "./components/bracket/bracket.component";

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
      /*{
        path: 'match/next',
        component: StreamingMatchNextComponent,
      },
      {
        path: 'match/details',
        component: StreamingMatchDetailsComponent,
      },
      {
        path: 'match/view',
        component: StreamingMatchViewComponent,
      },
      {
        path: 'match/pb/:number',
        component: StreamingMatchPicksBansComponent,
      },
      {
        path: 'match/results',
        component: StreamingMatchResultsComponent,
      },*/
    ],
  },
];
