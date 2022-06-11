import Category from "@EnterpriseBusinessRules/Category";

import type { RawObjectDataProcessor } from "@yamato-daiwa/es-extensions";


const CategorySchema: RawObjectDataProcessor.PropertiesSpecification = {
  ID: {
    type: Category.ID.TYPE,
    required: Category.ID.REQUIRED,
    minimalCharactersCount: Category.ID.MINIMAL_CHARACTERS_COUNT
  },
  name: {
    type: Category.Name.TYPE,
    required: Category.Name.REQUIRED,
    minimalCharactersCount: Category.Name.MINIMAL_CHARACTERS_COUNT,
    maximalCharactersCount: Category.Name.MAXIMAL_CHARACTERS_COUNT
  }
};


export default CategorySchema;
