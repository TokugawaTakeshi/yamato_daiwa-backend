import Routing from "./Routing";

/* --- GUI components ----------------------------------------------------------------------------------------------- */
import TopPage from "../Components/PagesAndRelated/Top/TopPage.vue";
import NotFoundPage from "../Components/PagesAndRelated/NotFound/NotFoundPage.vue";

/* --- Framework ---------------------------------------------------------------------------------------------------- */
import type VueRouter from "vue-router";
import type { RouteComponent } from "vue-router";
import { createRouter as createVueRouter, createWebHashHistory } from "vue-router";


const router: VueRouter.Router = createVueRouter({
  history: createWebHashHistory(),
  routes: [

    /* --- Authentication ------------------------------------------------------------------------------------------- */
    {
      path: Routing.Top.URI_Path,
      component: TopPage
    },
    {
      path: Routing.Statistics.URI_Path,
      component: async (): Promise<RouteComponent> => import("../Components/PagesAndRelated/Statistics/StatisticsPage.vue")
    },
    {
      name: Routing.Errors.NotFound.NAME,
      path: "/:pathMatch(.*)*",
      component: NotFoundPage
    }
  ]
});


export default router;
