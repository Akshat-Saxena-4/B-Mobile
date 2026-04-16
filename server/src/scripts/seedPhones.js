/**
 * Demo catalog: phones, tablets, and laptops with premium marketplace-style copy and INR pricing.
 *
 * Run: npm run seed:phones (from repo root) - requires MongoDB.
 */
import { seedDemoCatalog } from '../services/catalogSeedService.js';

seedDemoCatalog({
  overwrite: true,
  connect: true,
  disconnect: true,
  logger: console,
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
