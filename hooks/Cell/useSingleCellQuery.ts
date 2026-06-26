import { fetchSingleCell } from "@/services/Cell/cell.service";
import { Cell } from "@/services/Cell/cell.types";
import { useQuery } from "@tanstack/react-query";

export const useSingleCellQuery = (cellId: number) => {
  const isValid = cellId > 0;
  
  return useQuery<Cell>({
    queryKey: ["cells", cellId],
    queryFn: async () => {
      const res = await fetchSingleCell(cellId);
      return res![0];
    },
    enabled: isValid,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    }
  });
};
