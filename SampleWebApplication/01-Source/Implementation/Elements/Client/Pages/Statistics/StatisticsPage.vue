<template lang="pug">

.StatisticsPage Statistics page

</template>


<script lang="ts">

  /* --- Enterprise business rules ---------------------------------------------------------------------------------- */
  import Product from "@Entities/Product";

  /* --- Application business rules --------------------------------------------------------------------------------- */
  import ProductGateway from "@Gateways/ProductGateway";

  /* --- Framework -------------------------------------------------------------------------------------------------- */
  import { Options as VueComponentConfiguration, Vue as VueComponent } from "vue-property-decorator";

  /* --- Utils ------------------------------------------------------------------------------------------------------ */
  import ClientDependenciesInjector from "@Client/ClientDependenciesInjector";
  import { Logger } from "@yamato-daiwa/es-extensions";


  @VueComponentConfiguration({
    name: "StatisticsPage",
    components: {}
  })
  export default class StatisticsPage extends VueComponent {

    public async created(): Promise<void> {

      const productGateway: ProductGateway = await ClientDependenciesInjector.loadProductGateway();
      const responseData: ProductGateway.SelectionRetrieving.ResponseData = await productGateway.retrieveSelection({
        itemsCountPerPaginationPage: 20,
        paginationPageNumber: 1
      });
      const products: Array<Product> = responseData.itemsOfTargetPaginationPage;

      Logger.logSuccess({
        title: "Categories retrieved",
        description: "Categories has been retrieved",
        additionalData: { products }
      });

    }

  }

</script>
