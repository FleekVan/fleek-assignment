import type { DB } from "@fleek-packages/database";
import { ObjectTypeComposer, ResolverResolveParams } from "graphql-compose";
import { GraphQLContext } from "../GraphQLContext";

export const StoreRecordType = ObjectTypeComposer.createTemp<
  DB["StoreRecord"],
  GraphQLContext
>({
  name: "StoreRecord",
  fields: {
    id: "ID!",
    name: "String!",
    value: "String!",
  },
});

StoreRecordType.addResolver({
  name: "createOne",
  type: StoreRecordType,
  args: {
    name: "String!",
    value: "String!",
  },
  resolve: async ({
    args,
    context,
  }: ResolverResolveParams<
    unknown,
    GraphQLContext,
    { name: string; value: string }
  >) => {
    return await context.services.storeRecord.createOne(args);
  },
});
