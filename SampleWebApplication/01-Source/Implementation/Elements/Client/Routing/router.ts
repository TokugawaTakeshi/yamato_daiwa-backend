import Routing from "./Routing";

/* --- Page components ---------------------------------------------------------------------------------------------- */
import TopPage from "@Client/Pages/Top/TopPage.vue";
import NotFoundPage from "@Client/Pages/Errors/NotFoundPage.vue";

/* --- Framework ---------------------------------------------------------------------------------------------------- */
import type VueRouter from "vue-router";
import type { RouteComponent } from "vue-router";
import { createRouter as createVueRouter, createWebHashHistory } from "vue-router";


const router: VueRouter.Router = createVueRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: Routing.Top.URI_PATH,
      component: TopPage
    },
    {
      path: Routing.Statistics.URI_PATH,
      component: async (): Promise<RouteComponent> => import("../Pages/Statistics/StatisticsPage.vue")
    },
    {
      name: Routing.Errors.NotFound.NAME,
      path: "/:pathMatch(.*)*",
      component: NotFoundPage
    }
  ]
});


export default router;
