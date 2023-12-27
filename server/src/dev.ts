import { Database } from "@fleek-packages/database";
import { server } from "./server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { createContext } from "./graphql/createContext";

async function main() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 5001 },
    context: async () => {
      const db = new Database("production");
      await db.connect();

      return createContext(db.con);
    },
  });

  console.log(`🚀  Server ready at: ${url}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
