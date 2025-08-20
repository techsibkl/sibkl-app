import { FlashList } from "@shopify/flash-list";
import React from "react";
import CellCard from "./CellCard";
import EmptyList from "./EmptyList";
import { Cell } from "@/services/Cell/cell.types";

type CellListProps = {
  cells: Cell[];
};

const CellList = ({ cells }: CellListProps) => {
  return (
    <FlashList
      data={cells}
      renderItem={({ item: cell }) => <CellCard cell={cell} />}
      ListEmptyComponent={<EmptyList />}
      estimatedItemSize={100}
    />
  );
};

export default CellList;
