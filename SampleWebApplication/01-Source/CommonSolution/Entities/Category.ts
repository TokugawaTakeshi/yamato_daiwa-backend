type Category = {
  readonly ID: Category.ID;
  name: string;
};


namespace Category {

  export type ID = string;
  export namespace ID {
    export const TYPE: StringConstructor = String;
    export const REQUIRED: boolean = true;
    export const MINIMAL_CHARACTERS_COUNT: number = 1;
  }

  export namespace Name {
    export const TYPE: StringConstructor = String;
    export const REQUIRED: boolean = true;
    export const MINIMAL_CHARACTERS_COUNT: number = 2;
    export const MAXIMAL_CHARACTERS_COUNT: number = 255;
  }

}


export default Category;
