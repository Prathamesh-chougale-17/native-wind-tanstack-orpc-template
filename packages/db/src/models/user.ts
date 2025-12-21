import { client } from "../index";
import mongoose from "mongoose";

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

		// Try multiple query strategies
		let user = null;

		// 1. Try as string _id
		user = await collection.findOne({ _id: userId });

		// 2. Try as ObjectId
		if (!user) {
			try {
				const objectId = new mongoose.Types.ObjectId(userId);
				user = await collection.findOne({ _id: objectId });
			} catch (e) {
				// Invalid ObjectId format, continue
			}
		}

		// 3. Try with id field (string)
		if (!user) {
			user = await collection.findOne({ id: userId });
		}

		return user;
	},

	async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
		const collection = client.collection("user");

		// Try to convert to ObjectId if valid format
		let query: any = { id: userId };
		try {
			const objectId = new mongoose.Types.ObjectId(userId);
			query = { $or: [{ _id: objectId }, { _id: userId }, { id: userId }] };
		} catch (e) {
			query = { $or: [{ _id: userId }, { id: userId }] };
		}

		const result = await collection.updateOne(
			query,
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

		// Try to convert to ObjectId if valid format
		let query: any = { id: userId };
		try {
			const objectId = new mongoose.Types.ObjectId(userId);
			query = { $or: [{ _id: objectId }, { _id: userId }, { id: userId }] };
		} catch (e) {
			query = { $or: [{ _id: userId }, { id: userId }] };
		}

		const result = await collection.updateOne(
			query,
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

		// Try to convert to ObjectId if valid format
		let query: any = { id: userId };
		try {
			const objectId = new mongoose.Types.ObjectId(userId);
			query = { $or: [{ _id: objectId }, { _id: userId }, { id: userId }] };
		} catch (e) {
			query = { $or: [{ _id: userId }, { id: userId }] };
		}

		const result = await collection.updateOne(
			query,
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

		// Try to convert to ObjectId if valid format
		let query: any = { id: userId };
		try {
			const objectId = new mongoose.Types.ObjectId(userId);
			query = { $or: [{ _id: objectId }, { _id: userId }, { id: userId }] };
		} catch (e) {
			query = { $or: [{ _id: userId }, { id: userId }] };
		}

		const result = await collection.updateOne(
			query,
			{
				$set: updateData,
			}
		);
		return result.modifiedCount > 0;
	},
};
