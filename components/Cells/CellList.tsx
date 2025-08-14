import { FlashList } from "@shopify/flash-list";
import React from "react";
import CellCard from "./CellCard";
import EmptyList from "./EmptyList";

type CellListProps = {
  cells: any[];
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
