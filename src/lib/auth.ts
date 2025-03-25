import { betterAuth } from "better-auth";
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient();

// import { createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
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
