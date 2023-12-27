import { ObjectTypeComposer, ResolverResolveParams } from "graphql-compose";
import { StoreRecordType } from "./StoreRecord";
import { PaginationMetaType } from "./PaginationMetaType";
import { PaginationInputSchema } from "../../model/PaginationMeta";
import { GraphQLContext } from "../GraphQLContext";

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
    const query = PaginationInputSchema.parse(args);
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
