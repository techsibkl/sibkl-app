import { Cell } from "@/services/Cell/cell.types";
import { fetchDistrictCells, fetchDistricts } from "@/services/District/district.service";
import { District } from "@/services/District/district.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useDistrictsQuery = () => {
	return useQuery<District[]>({
		queryKey: ["districts"],
		queryFn: fetchDistricts,
		staleTime: 5 * 60 * 1000,
		retry: (failureCount, error: any) => {
			if (error?.status === 401 || error?.status === 403) return false;
			return failureCount < 3;
		},
	});
};

/**
 * Cells scoped to the given district when districtId is provided,
 * otherwise falls back to all cells. Cache-first: reuses existing
 * query data to avoid redundant network calls.
 */
export const useAssignableCellsQuery = (districtId: number | null | undefined) => {
	const qc = useQueryClient();

	return useQuery<Cell[]>({
		queryKey: ["cells", "assignable", districtId],
		queryFn: async () => {
			if (districtId) {
				const cached = qc.getQueryData<Cell[]>(["cells", "district", districtId]);
				if (cached) return cached;
				return await fetchDistrictCells(districtId);
			} else {
				const cached = qc.getQueryData<Cell[]>(["cells"]);
				if (cached) return cached;
				const { fetchCells } = await import("@/services/Cell/cell.service");
				return await fetchCells();
			}
		},
		retry: (failureCount, error: any) => {
			if (error?.status === 401 || error?.status === 403) return false;
			return failureCount < 3;
		},
	});
};
