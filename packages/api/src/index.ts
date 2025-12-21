import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({
		context: {
			session: context.session,
		},
	});
});

export const protectedProcedure = publicProcedure.use(requireAuth);

// Admin-only middleware
const requireAdmin = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED", {
			message: "You must be logged in to access this resource",
		});
	}

	const userRole = (context.session.user as any).role;
	if (userRole !== "admin") {
		throw new ORPCError("FORBIDDEN", {
			message: "You must be an admin to access this resource",
		});
	}

	return next({
		context: {
			session: context.session,
			user: context.session.user,
		},
	});
});

export const adminProcedure = publicProcedure.use(requireAdmin);

// Org-only middleware (org and admin can access)
const requireOrgOrAdmin = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED", {
			message: "You must be logged in to access this resource",
		});
	}

	const userRole = (context.session.user as any).role;
	if (userRole !== "org" && userRole !== "admin") {
		throw new ORPCError("FORBIDDEN", {
			message: "You must be an organization member or admin to access this resource",
		});
	}

	return next({
		context: {
			session: context.session,
			user: context.session.user,
		},
	});
});

export const orgProcedure = publicProcedure.use(requireOrgOrAdmin);
