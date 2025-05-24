import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "mysql",
  }),
   emailAndPassword: {  
        enabled: true
    },
    socialProviders: { 
        github: { 
           clientId: process.env.GITHUB_CLIENT_ID as string, 
           clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }
    }, 
});