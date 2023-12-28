import { ObjectTypeComposer, ResolverResolveParams } from "graphql-compose";
import { StoreRecordType } from "./StoreRecord";
import { PaginationMetaType } from "./PaginationMetaType";
import { PaginationInputSchema } from "../../model/PaginationMeta";
import { GraphQLContext } from "../GraphQLContext";
import { zodValidate } from "../../utils/zodValidate";
import { z } from "zod";
import {
  StoreRecordSchema,
  StoreRecordUpdateSchema,
} from "../../schema/StoreRecordSchema";

export const StoreRecordListType = ObjectTypeComposer.createTemp({
  name: "StoreRecordList",
  fields: {
    nodes: StoreRecordType.NonNull.List.NonNull,
    meta: PaginationMetaType.NonNull,
  },
});

StoreRecordListType.addResolver({
  name: "findMany",
  type: StoreRecordListType.NonNull,
  args: {
    limit: "Int",
    offset: "Int",
  },
  resolve: async ({
    context,
    args,
  }: ResolverResolveParams<
    unknown,
    GraphQLContext,
    { limit?: number; offset?: number }
  >) => {
    const query = zodValidate(PaginationInputSchema, args);
    const nodes = await context.services.storeRecord.findMany(query);
    return {
      nodes,
      meta: {
        total: nodes.length,
        limit: query.limit,
        offset: query.offset,
      },
    };
  },
});

StoreRecordListType.addResolver({
  name: "createMany",
  type: StoreRecordListType.NonNull,
  args: {
    records: StoreRecordType.getInputTypeComposer()
      .clone("StoreRecordCreateManyInput")
      .removeField("id").NonNull.List.NonNull,
  },
  resolve: async ({
    args,
    context,
  }: ResolverResolveParams<
    unknown,
    GraphQLContext,
    { records: Array<{ name: string; value: string }> }
  >) => {
    const records = zodValidate(z.array(StoreRecordSchema), args.records);
    const nodes = await Promise.all(
      records.map((record) => context.services.storeRecord.createOne(record)),
    );
    return {
      nodes,
      meta: {
        total: nodes.length,
        limit: nodes.length,
        offset: 0,
      },
    };
  },
});

StoreRecordListType.addResolver({
  name: "updateMany",
  type: StoreRecordListType.NonNull,
  args: {
    records: StoreRecordType.getInputTypeComposer().NonNull.List.NonNull,
  },
  resolve: async ({
    args,
    context,
  }: ResolverResolveParams<
    unknown,
    GraphQLContext,
    { records: Array<{ id: string; name: string; value: string }> }
  >) => {
    const records = zodValidate(z.array(StoreRecordUpdateSchema), args.records);
    const nodes = await Promise.all(
      records.map((record) => context.services.storeRecord.updateOne(record)),
    );
    return {
      nodes,
      meta: {
        total: nodes.length,
        limit: nodes.length,
        offset: 0,
      },
    };
  },
});
