import { SchemaComposer } from "graphql-compose";
import { StoreRecordListType } from "./types/StoreRecordList";

export function createSchema() {
  const composer = new SchemaComposer();

  composer.Query.addFields({
    hello: {
      type: "String",
      resolve: () => "Hello, World!",
    },
    storeRecordList: StoreRecordListType.getResolver("findMany"),
  });

  return composer.buildSchema();
}
