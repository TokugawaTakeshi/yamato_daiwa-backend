<template lang="pug">

  .MainLayout

    .MainLayout-UpperFixedContentSlot

      HeaderWithNavigationMenu

      slot(name="AdditionalUpperFixedContent")


    .MainLayout-MainContent

      .MainLayout-Sidebar

        NavigationMenu

        slot(name="AdditionalSidebarContent")


      .MainLayout-DynamicContent

        slot

    //-
      .MainLayout-DrawerOverlay
        .MainLayout-Drawer

          NavigationMenu

</template>


<script lang="ts">

  /* --- 子コンポネント -------------------------------------------------------------------------------------------------- */
  import HeaderWithNavigationMenu from "../../HeaderWithNavigationMenu/HeaderWithNavigationMenu.vue";
  import NavigationMenu from "../../../SharedReusable/NavigationMenu/NavigationMenu.vue";

  /* --- フレームワーク --------------------------------------------------------------------------------------------------- */
  import { Vue, Component } from "vue-property-decorator";


  @Component({
    components: {
      HeaderWithNavigationMenu,
      NavigationMenu
    }
  })
  export default class MainLayout extends Vue {}
</script>
