import { SchemaComposer } from "graphql-compose";
import { StoreRecordListType } from "./types/StoreRecordList";
import { StoreRecordType } from "./types/StoreRecord";

export function createSchema() {
  const composer = new SchemaComposer();

  composer.Query.addFields({
    hello: {
      type: "String",
      resolve: () => "Hello, World!",
    },
    storeRecordList: StoreRecordListType.getResolver("findMany"),
  });

  composer.Mutation.addFields({
    storeRecordCreate: StoreRecordType.getResolver("createOne"),
    storeRecordUpdate: StoreRecordType.getResolver("updateOne"),
    storeRecordCreateMany: StoreRecordListType.getResolver("createMany"),
  });

  return composer.buildSchema();
}
