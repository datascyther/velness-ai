// Velness auto-hooks plugin for OpenCode.
// Loaded automatically from .opencode/plugins/ at startup.
//
// Provides:
//  - A session-start reminder of repo constraints (AGENTS.md, frozen backend,
//    live-prod integration tests).
//  - A non-blocking warning when a Supabase schema/migration command is run,
//    since the backend is FROZEN and requires a new migration + freeze re-review.

export const VelnessGuard = async ({ client }) => {
  return {
    "session.created": async () => {
      await client.app.log({
        body: {
          service: "velness-guard",
          level: "info",
          message:
            "Velness session started. Read AGENTS.md first. Backend is FROZEN (backend/FREEZE.md): schema/RLS changes need a new migration + freeze re-review. `npm run test:integration` targets the LIVE production Supabase project.",
        },
      });
    },

    "tool.execute.before": async (input, output) => {
      if (input.tool !== "bash") return;
      const cmd = output.args?.command || "";
      if (/supabase\s+(db push|db reset|migration (new|up|down))/i.test(cmd)) {
        await client.app.log({
          body: {
            service: "velness-guard",
            level: "warn",
            message:
              "Backend is FROZEN. `supabase db push` / migration changes require a NEW migration file plus a freeze re-review (see backend/FREEZE.md). Confirm before proceeding.",
          },
        });
      }
    },
  };
};
