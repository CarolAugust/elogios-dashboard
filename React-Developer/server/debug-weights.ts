import { storage } from "./storage";

(async () => {
  const w = await storage.getWeights();
  console.log("WEIGHTS =", w);
  process.exit(0);
})();
