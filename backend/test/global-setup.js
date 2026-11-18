const { execSync } = require("child_process");

// NOTE: A few changes were made in migration scripts to support partial unique indexes.
// We run the migrations because db push does not apply those changes correctly.
// Run once per jest invocation instead of once per test file.
module.exports = async () => {
  execSync("npx prisma migrate deploy", { stdio: "ignore" });
};
