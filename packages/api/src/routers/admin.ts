import { adminProcedure } from "../index";
import { z } from "zod";
import {
	organizationHelpers,
	userHelpers,
	type UserRole,
} from "@native-wind-tanstack-orpc-template/db";

export const adminRouter = {
	// Organization Management
	createOrganization: adminProcedure
		.input(
			z.object({
				name: z.string().min(1, "Organization name is required"),
				description: z.string().optional(),
			})
		)
		.handler(async ({ input, context }) => {
			const userId = context.user.id;
			const orgId = await organizationHelpers.createOrganization({
				name: input.name,
				description: input.description,
				createdBy: userId,
				isActive: true,
			});

			return {
				success: true,
				organizationId: orgId.toString(),
				message: "Organization created successfully",
			};
		}),

	getAllOrganizations: adminProcedure.handler(async () => {
		const organizations = await organizationHelpers.getAllOrganizations();
		return {
			organizations: organizations.map((org) => ({
				id: org._id?.toString(),
				name: org.name,
				description: org.description,
				createdAt: org.createdAt,
				isActive: org.isActive,
			})),
		};
	}),

	updateOrganization: adminProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				description: z.string().optional(),
				isActive: z.boolean().optional(),
			})
		)
		.handler(async ({ input }) => {
			const { id, ...updateData } = input;
			const success = await organizationHelpers.updateOrganization(id, updateData);

			if (!success) {
				throw new Error("Failed to update organization");
			}

			return {
				success: true,
				message: "Organization updated successfully",
			};
		}),

	deleteOrganization: adminProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.handler(async ({ input }) => {
			const success = await organizationHelpers.deleteOrganization(input.id);

			if (!success) {
				throw new Error("Failed to delete organization");
			}

			return {
				success: true,
				message: "Organization deleted successfully",
			};
		}),

	getOrganizationUsers: adminProcedure
		.input(
			z.object({
				organizationId: z.string(),
			})
		)
		.handler(async ({ input }) => {
			const users = await organizationHelpers.getOrganizationUsers(
				input.organizationId
			);
			return {
				users: users.map((user: any) => ({
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role || "user",
					organizationId: user.organizationId,
				})),
			};
		}),

	// User Management
	getAllUsers: adminProcedure.handler(async () => {
		const users = await userHelpers.getAllUsers();
		return {
			users: users.map((user: any) => ({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role || "user",
				organizationId: user.organizationId,
				createdAt: user.createdAt,
				emailVerified: user.emailVerified,
			})),
		};
	}),

	updateUserRole: adminProcedure
		.input(
			z.object({
				userId: z.string(),
				role: z.enum(["user", "org", "admin"]),
			})
		)
		.handler(async ({ input }) => {
			const success = await userHelpers.updateUserRole(
				input.userId,
				input.role as UserRole
			);

			if (!success) {
				throw new Error("Failed to update user role");
			}

			return {
				success: true,
				message: "User role updated successfully",
			};
		}),

	assignUserToOrganization: adminProcedure
		.input(
			z.object({
				userId: z.string(),
				organizationId: z.string(),
				role: z.enum(["user", "org", "admin"]).optional(),
			})
		)
		.handler(async ({ input }) => {
			if (input.role) {
				await userHelpers.updateUserWithRoleAndOrg(
					input.userId,
					input.role as UserRole,
					input.organizationId
				);
			} else {
				await userHelpers.assignUserToOrganization(
					input.userId,
					input.organizationId
				);
			}

			return {
				success: true,
				message: "User assigned to organization successfully",
			};
		}),

	removeUserFromOrganization: adminProcedure
		.input(
			z.object({
				userId: z.string(),
			})
		)
		.handler(async ({ input }) => {
			const success = await userHelpers.removeUserFromOrganization(input.userId);

			if (!success) {
				throw new Error("Failed to remove user from organization");
			}

			return {
				success: true,
				message: "User removed from organization successfully",
			};
		}),

	getUsersByOrganization: adminProcedure
		.input(
			z.object({
				organizationId: z.string(),
			})
		)
		.handler(async ({ input }) => {
			const users = await userHelpers.getUsersByOrganization(
				input.organizationId
			);
			return {
				users: users.map((user: any) => ({
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role || "user",
					organizationId: user.organizationId,
				})),
			};
		}),

	getUsersByRole: adminProcedure
		.input(
			z.object({
				role: z.enum(["user", "org", "admin"]),
			})
		)
		.handler(async ({ input }) => {
			const users = await userHelpers.getUsersByRole(input.role as UserRole);
			return {
				users: users.map((user: any) => ({
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role || "user",
					organizationId: user.organizationId,
				})),
			};
		}),
};
