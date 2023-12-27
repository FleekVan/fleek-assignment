import type { StoreRecord } from "@fleek-packages/database/model";
import { ObjectTypeComposer } from "graphql-compose";
import { GraphQLContext } from "../GraphQLContext";

export const StoreRecordType = ObjectTypeComposer.createTemp<
  StoreRecord,
  GraphQLContext
>({
  name: "StoreRecord",
  fields: {
    key: "String!",
    value: "String!",
  },
});
