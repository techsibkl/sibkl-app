import { Person } from "@/services/Person/person.type";

export type PeoplePaginatedParams = {
	page?: number;
	pageSize?: number;
	search?: string;
	sortField?: string;
	sortOrder?: "ASC" | "DESC";
	role?: string;
	includeArchived?: boolean;
	filters?: Record<string, string[]>;
};

export type PeoplePaginatedMeta = {
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export type PeoplePaginatedResponse = {
	data: Person[];
	meta: PeoplePaginatedMeta;
};
