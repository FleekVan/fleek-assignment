import { server } from "./server";
import { startStandaloneServer } from "@apollo/server/standalone";

async function main() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 5001 },
  });

  console.log(`🚀  Server ready at: ${url}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
