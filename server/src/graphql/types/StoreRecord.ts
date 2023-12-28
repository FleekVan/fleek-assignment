import type { DB } from "@fleek-packages/database";
import { ObjectTypeComposer, ResolverResolveParams } from "graphql-compose";
import { GraphQLContext } from "../GraphQLContext";
import {
  StoreRecordSchema,
  StoreRecordUpdateSchema,
} from "../../schema/StoreRecordSchema";
import { zodValidate } from "../../utils/zodValidate";

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
    const record = zodValidate(StoreRecordSchema, args);
    return await context.services.storeRecord.createOne(record);
  },
});

StoreRecordType.addResolver({
  name: "updateOne",
  type: StoreRecordType,
  args: {
    id: "ID!",
    name: "String!",
    value: "String!",
  },
  resolve: async ({
    args,
    context,
  }: ResolverResolveParams<
    unknown,
    GraphQLContext,
    { id: string; name: string; value: string }
  >) => {
    const record = zodValidate(StoreRecordUpdateSchema, args);
    return await context.services.storeRecord.updateOne(record);
  },
});
