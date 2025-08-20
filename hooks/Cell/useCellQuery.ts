import { fetchCells } from "@/services/Cell/cell.service";
import { Cell } from "@/services/Cell/cell.types";
import { useQuery } from "@tanstack/react-query";

export const useCellsQuery = () => {
  return useQuery<Cell[]>({
    queryKey: ["cells"],
    queryFn: () => fetchCells(),
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    }
  });
};