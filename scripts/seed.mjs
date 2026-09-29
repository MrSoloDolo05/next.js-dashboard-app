// Convenience wrapper around the /seed route handler: seeds users, customers,
// invoices and revenue, then prints the result. Requires `pnpm db:up` and
// `pnpm dev` to be running.
const baseUrl = process.env.APP_URL ?? 'http://localhost:3000';

try {
  const response = await fetch(`${baseUrl}/seed`);
  const body = await response.json();

  if (!response.ok) {
    console.error(`Seeding failed (${response.status}):`, body);
    process.exitCode = 1;
  } else {
    console.log(`Seeding ${baseUrl}/seed ->`, body);
  }
} catch (error) {
  console.error(`Could not reach ${baseUrl}/seed. Is \`pnpm dev\` running?`);
  console.error(error.message);
  process.exitCode = 1;
}
