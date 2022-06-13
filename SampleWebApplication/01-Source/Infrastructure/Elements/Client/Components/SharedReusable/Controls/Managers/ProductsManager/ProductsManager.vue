<template lang="pug">

  .ProductsManager

    SearchBox.ProductsManager-SearchInputField(
      :minimalSymbolsRequiredForSearchRequest="2"
      :disabled="relatedStoreModule.selectionIsBeingRetrievedNowOrRetrievingWillBeginShortly"
    )

    .ProductsManager-CardsFlow(
      v-if="relatedStoreModule.selectionIsBeingRetrievedNowOrRetrievingWillBeginShortly"
    )
      .ProductsManager-TemporaryLoadingPlaceholder(
        v-for="cardNumber of 5"
      )

    AttentionBox.ProductsManager-ErrorMessage(
      v-else-if="relatedStoreModule.wasSelectionRetrievingErrorOccurred"
      :decoration="AttentionBox.DecorativeVariations.error"
      :hasPrependedSVG_Icon="true"
    ).
      受信中不具合が発生致しました。御詫び申し上げます。原因はインターネット接続喪失ではなければ、開発側に通知が送信され、可能な限り対策を御取り致します。
      御迷惑をおかけ致しまして、誠に申し訳御座いません。

    .ProductsManager-NoItemsMessage(
      v-else-if="relatedStoreModule.totalItemsCount === 0"
    )
      p.ProductsManager-NoItemsMessage-Texting 現在、商品カテゴリーが一件も登録されていない状態です。
      span.ProductsManager-NoItemsMessage-ActionLink(
        role="button"
        tabindex="0"
      ) 商品カテゴリーを追加する

    .ProductsManager-NoItemsMessage(
      v-else-if="relatedStoreModule.selectionItemsCount === 0"
    )
      p.ProductsManager-NoItemsMessage-Texting 検索要求と合っている商品カテゴリーは登録されていません。
      span.ProductsManager-NoItemsMessage-ActionLink(
        role="button"
        tabindex="0"
      ) 全カテゴリーを表示


    template(
      v-else
    )

      .ProductsManager-CardsFlow
        ProductCard(
          v-for="product of relatedStoreModule.selection__actualForSpecifiedPaginationPage"
          :key="`PRODUCT_CARD-${product.ID}`"
          :product="product"
        )

      .ProductsManager-ProductAddingPanel
        .ProductsManager-ProductAddingPanel-Heading 商品を追加する

</template>


<script lang="ts">

  /* --- データ ------------------------------------------------------------------------------------------------------- */
  import ProductsManagerStoreModule from "./ProductsManager.vuex";

  /* --- 子コンポネント -------------------------------------------------------------------------------------------------- */
  import ProductCard from "../../Cards/Product/ProductCard.vue";
  import {
    SearchBox,
    AttentionBox
  } from "hikari-frontend/Components-Vue";

  /* --- フレームワーク --------------------------------------------------------------------------------------------------- */
  import { Vue, Component } from "vue-property-decorator";
  import { getModule } from "vuex-module-decorators";


  @Component({
    components: {
      SearchBox,
      AttentionBox,
      ProductCard
    }
  })
  export default class ProductsManager extends Vue {

    private readonly relatedStoreModule: ProductsManagerStoreModule = getModule(ProductsManagerStoreModule);


    private async created(): Promise<void> {

      this.initializeNonReactiveAssets();

      try {

        await this.relatedStoreModule.fetchSelection({
          paginationPageNumber: 1,
          itemsPerPaginationPage: 20
        });

      } catch (error: unknown) {
        console.error(error);
      }
    }


    private AttentionBox: typeof AttentionBox = AttentionBox;

    private initializeNonReactiveAssets(): void {
      this.AttentionBox = AttentionBox;
    }
  }
</script>
