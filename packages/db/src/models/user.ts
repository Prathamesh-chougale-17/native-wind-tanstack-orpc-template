import { client } from "../index";

export type UserRole = "user" | "org" | "admin";

export interface UserWithRole {
	_id: string;
	name: string;
	email: string;
	role: UserRole;
	organizationId?: string;
	createdAt: Date;
	emailVerified: boolean;
}

export const usersCollection = client.collection("user");

// Helper functions for user operations
export const userHelpers = {
	async getUserById(userId: string) {
		return usersCollection.findOne({ id: userId });
	},

	async updateUserRole(userId: string, role: UserRole) {
		const result = await usersCollection.updateOne(
			{ id: userId },
			{
				$set: {
					role,
					updatedAt: new Date(),
				},
			}
		);
		return result.modifiedCount > 0;
	},

	async assignUserToOrganization(userId: string, organizationId: string) {
		const result = await usersCollection.updateOne(
			{ id: userId },
			{
				$set: {
					organizationId,
					updatedAt: new Date(),
				},
			}
		);
		return result.modifiedCount > 0;
	},

	async removeUserFromOrganization(userId: string) {
		const result = await usersCollection.updateOne(
			{ id: userId },
			{
				$set: {
					organizationId: null,
					updatedAt: new Date(),
				},
			}
		);
		return result.modifiedCount > 0;
	},

	async getAllUsers() {
		return usersCollection.find({}).toArray();
	},

	async getUsersByRole(role: UserRole) {
		return usersCollection.find({ role }).toArray();
	},

	async getUsersByOrganization(organizationId: string) {
		return usersCollection.find({ organizationId }).toArray();
	},

	async updateUserWithRoleAndOrg(userId: string, role: UserRole, organizationId?: string) {
		const updateData: any = {
			role,
			updatedAt: new Date(),
		};

		if (organizationId !== undefined) {
			updateData.organizationId = organizationId;
		}

		const result = await usersCollection.updateOne(
			{ id: userId },
			{
				$set: updateData,
			}
		);
		return result.modifiedCount > 0;
	},
};
