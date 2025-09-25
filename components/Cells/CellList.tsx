import { Cell } from "@/services/Cell/cell.types";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import CellCard from "./CellCard";
import EmptyList from "./EmptyList";

type CellListProps = {
	cells: Cell[];
};

const CellList = ({ cells }: CellListProps) => {
	return (
		<FlashList
			data={cells}
			contentContainerStyle={{
				paddingHorizontal: 16,
				paddingVertical: 16,
			}}
			ListEmptyComponent={<EmptyList />}
			estimatedItemSize={100}
			renderItem={({ item: cell }) => <CellCard cell={cell} />}
		/>
	);
};

export default CellList;
