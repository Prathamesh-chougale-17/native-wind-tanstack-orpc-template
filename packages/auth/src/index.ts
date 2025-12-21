import { expo } from '@better-auth/expo';
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "@native-wind-tanstack-orpc-template/db";

export const auth = betterAuth({
	database: mongodbAdapter(client),
	trustedOrigins: [process.env.CORS_ORIGIN || "", "mybettertapp://", "exp://"],
	emailAndPassword: {
		enabled: true,
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "user",
				input: false,
			},
			organizationId: {
				type: "string",
				required: false,
				input: false,
			},
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
	plugins: [expo()],
});

export type Session = typeof auth.$Infer.Session;
