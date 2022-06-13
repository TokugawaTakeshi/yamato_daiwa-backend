<template lang="pug">

  nav.NavigationMenu
    ul.NavigationMenu-LinksList
      li.NavigationMenu-LinksListItem
        a.NavigationMenu-Link(
          href="#"
        ) Products list
      li.NavigationMenu-LinksListItem
        a.NavigationMenu-Link(
          href="#"
        ) Statistics

</template>


<script lang="ts">

  import { Vue as VueComponent, Options as VueComponentConfiguration } from "vue-property-decorator";

  @VueComponentConfiguration({})
  export default class NavigationMenu extends VueComponent {}

</script>
