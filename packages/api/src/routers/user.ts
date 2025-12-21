import { protectedProcedure, orgProcedure } from "../index";
import {
	organizationHelpers,
	userHelpers,
} from "@native-wind-tanstack-orpc-template/db";

export const userRouter = {
	// Get current user's profile with role and organization info
	getProfile: protectedProcedure.handler(async ({ context }) => {
		const user = context.session.user;
		const userDoc = await userHelpers.getUserById(user.id);

		let organization = null;
		if ((userDoc as any)?.organizationId) {
			organization = await organizationHelpers.getOrganizationById(
				(userDoc as any).organizationId
			);
		}

		return {
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: (userDoc as any)?.role || "user",
				organizationId: (userDoc as any)?.organizationId,
				emailVerified: user.emailVerified,
				createdAt: user.createdAt,
			},
			organization: organization
				? {
						id: organization._id?.toString(),
						name: organization.name,
						description: organization.description,
				  }
				: null,
		};
	}),

	// Get user's organization details
	getMyOrganization: protectedProcedure.handler(async ({ context }) => {
		const user = context.session.user;
		const userDoc = await userHelpers.getUserById(user.id);

		if (!(userDoc as any)?.organizationId) {
			return {
				organization: null,
				message: "You are not assigned to any organization",
			};
		}

		const organization = await organizationHelpers.getOrganizationById(
			(userDoc as any).organizationId
		);

		if (!organization) {
			return {
				organization: null,
				message: "Organization not found",
			};
		}

		return {
			organization: {
				id: organization._id?.toString(),
				name: organization.name,
				description: organization.description,
				createdAt: organization.createdAt,
				isActive: organization.isActive,
			},
		};
	}),

	// Get all active organizations (for reference)
	getOrganizations: protectedProcedure.handler(async () => {
		const organizations = await organizationHelpers.getAllOrganizations();
		return {
			organizations: organizations.map((org) => ({
				id: org._id?.toString(),
				name: org.name,
				description: org.description,
			})),
		};
	}),

	// Org members can view their organization members
	getOrganizationMembers: orgProcedure.handler(async ({ context }) => {
		const user = context.session.user;
		const userDoc = await userHelpers.getUserById(user.id);

		if (!(userDoc as any)?.organizationId) {
			throw new Error("You are not assigned to any organization");
		}

		const members = await userHelpers.getUsersByOrganization(
			(userDoc as any).organizationId
		);

		return {
			members: members.map((member: any) => ({
				id: member.id,
				name: member.name,
				email: member.email,
				role: member.role || "user",
			})),
		};
	}),
};
