/* --- Assets ------------------------------------------------------------------------------------------------------- */
import componentTemplate from "./SearchBox.vue.pug";

/* --- Children components ------------------------------------------------------------------------------------------ */
import Button from "../../Buttons/Plain/Vue/Button.vue";

/* --- Frameworks --------------------------------------------------------------------------------------------------- */
import Vue from "vue";
import {
  Vue as VueComponent,
  Component as VueComponentConfiguration,
  Prop as VueProperty
} from "vue-property-decorator";

/* --- Auxiliaries -------------------------------------------------------------------------------------------------- */
import {
  isUndefined,
  nullToEmptyString,
  Logger,
  InvalidParameterValueError
} from "hikari-es-extensions";


@VueComponentConfiguration({
  template: componentTemplate,
  components: {
    Button
  }
})
export default class SearchBox extends VueComponent {

  protected static readonly INVALID_REQUEST_TOOLTIP_DISPLAYING_DURATION__MILLISECONDS: number = 3000;
  protected static readonly NEW_REQUEST_EVENT_NAME: string = "newRequest";

  @VueProperty({ type: Number, default: 2 }) protected readonly minimalRequiredSymbolsForSearchRequest!: number;
  @VueProperty({ type: Boolean, default: false }) protected readonly disabled!: boolean;
  @VueProperty({ type: Boolean, default: false }) protected readonly searchOnEnterKey!: boolean;

  @VueProperty({ type: String }) protected readonly inputPlaceholder?: string;
  @VueProperty({ type: String }) protected readonly inputElementARIA_Label?: string;
  @VueProperty({ type: String }) protected readonly externalLabelHTML_ID?: string;


  protected inputtedSearchRequest: string = "";

  protected isTooltipDisplaying: boolean = false;

  protected readonly INPUT_ELEMENT_VUE_REFERENCE_ID: string = "INPUT_ELEMENT";
  protected readonly SUBMIT_SEARCH_REQUEST_BUTTON_VUE_REFERENCE_ID: string = "SUBMIT_SEARCH_REQUEST";


  public static getInstanceByVueReference(vueReferenceID: string, parentVueComponent: Vue): SearchBox {

    const referenceContent: Vue | Element | Array<Vue> | Array<Element> = parentVueComponent.$refs[vueReferenceID];

    if (isUndefined(referenceContent)) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidParameterValueError({
          customMessage: `There is no element or component corresponding to vue reference with ID: ${vueReferenceID}` +
              "and specified 'parentVueComponent'."
        }),
        title: InvalidParameterValueError.DEFAULT_TITLE,
        occurrenceLocation: "SearchBox.getInstanceByVueReference(vueReferenceID, parentVueComponent)"
      });
    }

    if (!(referenceContent instanceof SearchBox)) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidParameterValueError({
          customMessage: `The element or component corresponding to vue reference with ID: ${vueReferenceID}` +
              "and specified 'parentVueComponent' is not and instance of 'SearchBox'."
        }),
        title: InvalidParameterValueError.DEFAULT_TITLE,
        occurrenceLocation: "SearchBox.getInstanceByVueReference(vueReferenceID, parentVueComponent)"
      });
    }

    return referenceContent;
  }


  protected created(): void {

    this.initializeNonReactiveAssets();

    if (isUndefined(this.inputElementARIA_Label) && isUndefined(this.externalLabelHTML_ID)) {
      Logger.logWarning({
        title: "Accessibility issue",
        description: "Both 'inputElementARIA_Label' and 'externalLabelHTML_ID' has not been specified for the instance " +
            "of 'SearchBox' component."
      });
    }
  }

  public setDisplayingSearchRequest(newSearchRequest: string | null): void {
    this.inputtedSearchRequest = nullToEmptyString(newSearchRequest);
  }


  /* --- Controlling handling --------------------------------------------------------------------------------------- */
  protected submitSearchRequest(): void {

    if (this.inputtedSearchRequest.length < this.minimalRequiredSymbolsForSearchRequest) {

      this.isTooltipDisplaying = true;

      setTimeout((): void => {
        this.isTooltipDisplaying = false;
      }, SearchBox.INVALID_REQUEST_TOOLTIP_DISPLAYING_DURATION__MILLISECONDS);

      return;
    }

    this.$emit(SearchBox.NEW_REQUEST_EVENT_NAME, this.inputtedSearchRequest);
  }

  protected onClickResetSearchButton(): void {
    this.inputtedSearchRequest = "";
    this.$emit(SearchBox.NEW_REQUEST_EVENT_NAME, null);
  }

  protected onClickEnterKey(): void {

    if (this.searchOnEnterKey) {
      this.submitSearchRequest();
      return;
    }

    (this.$refs[this.SUBMIT_SEARCH_REQUEST_BUTTON_VUE_REFERENCE_ID] as Button).putTab();
  }


  /* --- Helpers ---------------------------------------------------------------------------------------------------- */
  private get isResetRequestButtonDisabled(): boolean {
    return this.inputtedSearchRequest.length === 0;
  }


  /* --- Non-reactive assets ---------------------------------------------------------------------------------------- */
  protected Button!: typeof Button;

  protected initializeNonReactiveAssets(): void {
    this.Button = Button;
  }
}
