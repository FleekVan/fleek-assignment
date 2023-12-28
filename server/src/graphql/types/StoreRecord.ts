import type { DB } from "@fleek-packages/database";
import { ObjectTypeComposer } from "graphql-compose";
import { GraphQLContext } from "../GraphQLContext";

export const StoreRecordType = ObjectTypeComposer.createTemp<
  DB["StoreRecord"],
  GraphQLContext
>({
  name: "StoreRecord",
  fields: {
    key: "String!",
    value: "String!",
  },
});
