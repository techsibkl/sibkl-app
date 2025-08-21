import { fetchSingleCell } from "@/services/Cell/cell.service";
import { Cell } from "@/services/Cell/cell.types";
import { useQuery } from "@tanstack/react-query";

export const useSingleCellQuery = (cellId: number) => {

  return useQuery<Cell>({
    queryKey: ["cells", cellId],
    queryFn: async () => {
      const res = await fetchSingleCell(cellId);
      return res![0];
    },
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    }
  });
};
