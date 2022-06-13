<template lang="pug">

  header.HeaderWithNavigationMenu

    HamburgerMenuButton.HeaderWithNavigationMenu-MenuButton

    DummyLogo(
      iconTextContent="仮名"
      heading="商品管理アプリ事例"
      subheading="無駄なスローガンは要らない"
    )

</template>


<script lang="ts">

  /* --- 子コンポネント -------------------------------------------------------------------------------------------------- */
  import {
    HamburgerMenuButton,
    DummyLogo
  } from "hikari-frontend/Components-Vue";

  /* --- フレームワーク --------------------------------------------------------------------------------------------------- */
  import { Vue, Component } from "vue-property-decorator";


  @Component({
    components: {
      HamburgerMenuButton,
      DummyLogo
    }
  })
  export default class HeaderWithNavigationMenu extends Vue {

  }
</script>
