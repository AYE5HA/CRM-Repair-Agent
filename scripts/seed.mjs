import { rm } from "node:fs/promises";
import path from "node:path";

const file = path.join(process.cwd(), "data", "crm-repair-agent.json");
await rm(file, { force: true });
console.log("Seed file cleared. Run the app to regenerate seeded demo data.");
