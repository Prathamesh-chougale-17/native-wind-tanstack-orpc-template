import { client } from "../index";
import mongoose from "mongoose";

export interface Organization {
	_id?: any;
	name: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string;
	isActive: boolean;
}

// Helper functions for organization operations
export const organizationHelpers = {
	async createOrganization(data: Omit<Organization, "_id" | "createdAt" | "updatedAt">): Promise<any> {
		const now = new Date();
		const organization: Omit<Organization, "_id"> = {
			...data,
			createdAt: now,
			updatedAt: now,
		};
		const collection = client.collection<Organization>("organizations");
		const result = await collection.insertOne(organization as any);
		return result.insertedId;
	},

	async getOrganizationById(id: string): Promise<Organization | null> {
		const collection = client.collection<Organization>("organizations");
		return collection.findOne({ _id: new mongoose.Types.ObjectId(id) } as any);
	},

	async getAllOrganizations(): Promise<Organization[]> {
		const collection = client.collection<Organization>("organizations");
		return collection.find({ isActive: true }).toArray();
	},

	async updateOrganization(id: string, data: Partial<Omit<Organization, "_id" | "createdAt">>): Promise<boolean> {
		const collection = client.collection<Organization>("organizations");
		const result = await collection.updateOne(
			{ _id: new mongoose.Types.ObjectId(id) } as any,
			{
				$set: {
					...data,
					updatedAt: new Date(),
				},
			} as any
		);
		return result.modifiedCount > 0;
	},

	async deleteOrganization(id: string): Promise<boolean> {
		const collection = client.collection<Organization>("organizations");
		// Soft delete
		const result = await collection.updateOne(
			{ _id: new mongoose.Types.ObjectId(id) } as any,
			{
				$set: {
					isActive: false,
					updatedAt: new Date(),
				},
			} as any
		);
		return result.modifiedCount > 0;
	},

	async getOrganizationUsers(orgId: string): Promise<any[]> {
		const usersCollection = client.collection("user");
		return usersCollection.find({ organizationId: orgId }).toArray();
	},
};
