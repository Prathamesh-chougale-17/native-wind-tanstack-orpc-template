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

// Helper functions for user operations
export const userHelpers = {
	async getUserById(userId: string): Promise<any> {
		const collection = client.collection("user");
		return collection.findOne({ id: userId });
	},

	async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
		const collection = client.collection("user");
		const result = await collection.updateOne(
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

	async assignUserToOrganization(userId: string, organizationId: string): Promise<boolean> {
		const collection = client.collection("user");
		const result = await collection.updateOne(
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

	async removeUserFromOrganization(userId: string): Promise<boolean> {
		const collection = client.collection("user");
		const result = await collection.updateOne(
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

	async getAllUsers(): Promise<any[]> {
		const collection = client.collection("user");
		return collection.find({}).toArray();
	},

	async getUsersByRole(role: UserRole): Promise<any[]> {
		const collection = client.collection("user");
		return collection.find({ role }).toArray();
	},

	async getUsersByOrganization(organizationId: string): Promise<any[]> {
		const collection = client.collection("user");
		return collection.find({ organizationId }).toArray();
	},

	async updateUserWithRoleAndOrg(userId: string, role: UserRole, organizationId?: string): Promise<boolean> {
		const collection = client.collection("user");
		const updateData: any = {
			role,
			updatedAt: new Date(),
		};

		if (organizationId !== undefined) {
			updateData.organizationId = organizationId;
		}

		const result = await collection.updateOne(
			{ id: userId },
			{
				$set: updateData,
			}
		);
		return result.modifiedCount > 0;
	},
};
