<template lang="pug">

.ApplicationRootComponent: RouterView

</template>


<script lang="ts">

  /* --- Framework -------------------------------------------------------------------------------------------------- */
  import { Options as VueComponentConfiguration, Vue as VueComponent } from "vue-property-decorator";


  @VueComponentConfiguration({
    components: {

    }
  })
  export default class RootComponent extends VueComponent {}

</script>
