<template lang="pug">

  .CategoriesManager

    SearchBox.CategoriesManager-SearchInputField(
      :disabled="ownService.selectionIsBeingRetrievedNowOrRetrievingWillBeginShortly"
      inputPlaceholder="カテゴリー名"
      inputElementARIA_Label="カテゴリー名で検索"
      @newRequest="onNewSearchRequestByName"
    )

    .CategoriesManager-CardsFlow(
      v-if="ownService.selectionIsBeingRetrievedNowOrRetrievingWillBeginShortly"
    )
      .CategoriesManager-TemporaryLoadingPlaceholder(
        v-for="cardNumber of 5"
      )

    AttentionBox.CategoriesManager-ErrorMessage(
      v-else-if="ownService.wasSelectionRetrievingErrorOccurred"
      :decoration="AttentionBox.DecorativeVariations.error"
      :hasPrependedSVG_Icon="true"
    ).
      受信中不具合が発生致しました。御詫び申し上げます。原因はインターネット接続喪失ではなければ、開発側に通知が送信され、可能な限り対策を御取り致します。
      御迷惑をおかけ致しまして、誠に申し訳御座いません。

    .CategoriesManager-NoItemsMessage(
      v-else-if="ownService.totalItemsCount === 0"
    )
      p.CategoriesManager-NoItemsMessage-Texting 現在、商品カテゴリーが一件も登録されていない状態です。
      span.CategoriesManager-NoItemsMessage-ActionLink(
        role="button"
        tabindex="0"
      ) 商品カテゴリーを追加する

    .CategoriesManager-NoItemsMessage(
      v-else-if="ownService.selectionItemsCount === 0"
    )
      p.CategoriesManager-NoItemsMessage-Texting 検索要求と合っている商品カテゴリーは登録されていません。
      span.CategoriesManager-NoItemsMessage-ActionLink(
        role="button"
        tabindex="0"
      ) 全カテゴリーを表示

    template(
      v-else
    )
      AttentionBox.CategoriesManager-Guidance(
        :decoration="AttentionBox.DecorativeVariations.guidance"
        :hasPrependedSVG_Icon="true"
      ) 関連商品を御覧に成るには商品カテゴリーを御選び下さい。

      .CategoriesManager-CardsFlow
        CategoryCard(
          v-for="productCategory of ownService.selection__actualForSpecifiedPaginationPage"
          :key="`PRODUCT_CATEGORY_CARD-${productCategory.ID}`"
          :productCategory="productCategory"
          @editCategory="startCategoryEditing(productCategory)"
        )

    .CategoriesManager-ProductCategoryEditingPanel

      .CategoriesManager-ProductCategoryEditingPanel-Heading カテゴリーを追加する

      InputField.CategoriesManager-ProductCategoryEditingPanel-InputField(
        v-model="inputtedCategoryName"
        :validation="categoryNameValidation"
        :ref="CATEGORY_NAME_INPUT_FIELD_VUE_REFERENCE_ID"
      )

      Button.CategoriesManager-ProductCategoryEditingPanel-Button(
        :decoration="Button.DecorativeVariations.accented"
      ) 追加

      Button.CategoriesManager-ProductCategoryEditingPanel-Button 編集停止

</template>


<script lang="ts">

  /* --- 企業のビジネスルール --------------------------------------------------------------------------------------------- */
  import Category from "../../../../../00-BusinessRules/Enterprise/Category";

  /* --- データ ------------------------------------------------------------------------------------------------------- */
  import CategoriesManagerService from "../CategoriesManager/CategoriesManager.vuex";

  /* --- 子コンポネント -------------------------------------------------------------------------------------------------- */
  import CategoryCard from "../../Cards/Category/CategoryCard.vue";
  import {
    SearchBox,
    AttentionBox,
    InputField,
    Button,
    ValidatableControlPayload,
    generateInitialValidatableControlPayload,
    ValueValidation
  } from "hikari-frontend/Components-Vue";

  /* --- フレームワーク --------------------------------------------------------------------------------------------------- */
  import { Vue as VueComponent, Component as VueComponentConfiguration } from "vue-property-decorator";
  import { getModule } from "vuex-module-decorators";
  import ProductCategoryInputtedDataValidations
    from "../../../../02-InteractiveImplementation/InputtedDataValidations/ProductCategoryInputtedDataValidations";


  @VueComponentConfiguration({
    components: {
      SearchBox,
      AttentionBox,
      CategoryCard,
      InputField,
      Button
    }
  })
  export default class CategoriesManager extends VueComponent {

    private readonly ownService: CategoriesManagerService = getModule(CategoriesManagerService);


    private async created(): Promise<void> {

      this.initializeNonReactiveAssets();

      try {

        await this.ownService.retrieveSelection({
          paginationPageNumber: 1,
          itemsPerPaginationPage: 20
        });

      } catch (error: unknown) {
        console.error(error);
      }
    }


    private async onNewSearchRequestByName(searchRequestByName: string | null): Promise<void> {

      try {

        await this.ownService.retrieveSelection({
          paginationPageNumber: 1,
          itemsPerPaginationPage: 20,
          searchingByName: searchRequestByName
        });

      } catch (error: unknown) {
        console.error(error);
      }
    }


    /* === カテゴリー追加・編集 =========================================================================================== */
    private inputtedCategoryName: ValidatableControlPayload<string> = generateInitialValidatableControlPayload("");
    private categoryNameValidation: ValueValidation<string> = ProductCategoryInputtedDataValidations.name;
    private readonly CATEGORY_NAME_INPUT_FIELD_VUE_REFERENCE_ID: string = "CATEGORY_NAME_INPUT_FIELD";

    private async onClickAddCategoryButton(): Promise<void> {

      const categoryNameInputField: InputField = InputField.getInstanceByReference(
        this.CATEGORY_NAME_INPUT_FIELD_VUE_REFERENCE_ID, this.$refs
      );

      if (this.inputtedCategoryName.isInvalid) {
        categoryNameInputField.focus();
        return;
      }


      let addedCategoryID: string;

      // TODO BlockingLoadingOverlay

      try {

        addedCategoryID = await CategoriesManagerService.getInstance().addCategory({
          name: this.inputtedCategoryName.value
        });

      } catch (error: unknown) {

        // TODO

      }
    }

    private startCategoryEditing(targetCategory: Category): void {
      InputField.getInstanceByReference(this.CATEGORY_NAME_INPUT_FIELD_VUE_REFERENCE_ID, this.$refs).
          setValue(targetCategory.name).
          focus();
    }

    /* === カテゴリー追加 =============================================================================================== */

    /* === 非リアクティブクラスフィールド ======================================================================================= */
    private AttentionBox: typeof AttentionBox = AttentionBox;
    private Button: typeof Button = Button;

    private initializeNonReactiveAssets(): void {
      this.AttentionBox = AttentionBox;
      this.Button = Button;
    }
  }
</script>
