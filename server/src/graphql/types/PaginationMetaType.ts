import { ObjectTypeComposer } from "graphql-compose";

export const PaginationMetaType = ObjectTypeComposer.createTemp({
  name: "PaginationMeta",
  fields: {
    total: "Int!",
    limit: "Int!",
    offset: "Int!",
  },
});
