<template lang="pug">

.TopPage

  | Top page

  Button(
    label="Test"
  )

</template>


<script lang="ts">

  import { Options as VueComponentConfiguration, Vue as VueComponent } from "vue-property-decorator";


  @VueComponentConfiguration({
    components: {}
  })
  export default class TopPage extends VueComponent { }

</script>


<style lang="stylus" scoped>

</style>
