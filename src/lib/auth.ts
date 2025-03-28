import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "../../prisma/instance";

// import { createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    cookiePrefix: "reusify",
  },
  // hooks: {
  //   before: createAuthMiddleware(async (ctx) => {
  //     const sessionToken = await ctx.getSignedCookie(
  //       "reusify.session_token",
  //       ctx.context.secret
  //     );
  //     console.log(sessionToken);
  //   }),
  // },
});
