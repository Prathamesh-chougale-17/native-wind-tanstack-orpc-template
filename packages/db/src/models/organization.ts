import { client } from "../index";
import type { ObjectId } from "mongodb";

export interface Organization {
	_id?: ObjectId;
	name: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string; // admin user id who created this org
	isActive: boolean;
}

export const organizationsCollection = client.collection<Organization>("organizations");

// Helper functions for organization operations
export const organizationHelpers = {
	async createOrganization(data: Omit<Organization, "_id" | "createdAt" | "updatedAt">) {
		const now = new Date();
		const organization: Omit<Organization, "_id"> = {
			...data,
			createdAt: now,
			updatedAt: now,
		};
		const result = await organizationsCollection.insertOne(organization as any);
		return result.insertedId;
	},

	async getOrganizationById(id: string) {
		const { ObjectId } = await import("mongodb");
		return organizationsCollection.findOne({ _id: new ObjectId(id) });
	},

	async getAllOrganizations() {
		return organizationsCollection.find({ isActive: true }).toArray();
	},

	async updateOrganization(id: string, data: Partial<Omit<Organization, "_id" | "createdAt">>) {
		const { ObjectId } = await import("mongodb");
		const result = await organizationsCollection.updateOne(
			{ _id: new ObjectId(id) },
			{
				$set: {
					...data,
					updatedAt: new Date(),
				},
			}
		);
		return result.modifiedCount > 0;
	},

	async deleteOrganization(id: string) {
		const { ObjectId } = await import("mongodb");
		// Soft delete
		const result = await organizationsCollection.updateOne(
			{ _id: new ObjectId(id) },
			{
				$set: {
					isActive: false,
					updatedAt: new Date(),
				},
			}
		);
		return result.modifiedCount > 0;
	},

	async getOrganizationUsers(orgId: string) {
		const usersCollection = client.collection("user");
		return usersCollection.find({ organizationId: orgId }).toArray();
	},
};
