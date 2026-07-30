import toastConfig from "@/config/toastConfig";
import {
	useAssignableCellsQuery,
	useDistrictsQuery,
} from "@/hooks/District/useDistrictQuery";
import {
	useAssignCellMutation,
	useAssignDistrictMutation,
} from "@/hooks/Flows/usePeopleFlowMutations";
import { Cell } from "@/services/Cell/cell.types";
import { District } from "@/services/District/district.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { useQueryClient } from "@tanstack/react-query";
import { CircleIcon, MapPinIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Modal, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import AssignDialogFooter from "./AssignDialogFooter";
import CellDropdown from "./CellDropdown";
import DistrictDropdown from "./DistrictDropdown";

export type AssignDistrictCellDialogProps = {
	visible: boolean;
	onDismiss: () => void;
	personFlow: PeopleFlow;
	flow_id: number;
	flow_title?: string;
	showDistrictTab: boolean;
	showCellTab: boolean;
};

const AssignDistrictCellDialog = ({
	visible,
	onDismiss,
	personFlow,
	flow_id,
	flow_title,
	showDistrictTab,
	showCellTab,
}: AssignDistrictCellDialogProps) => {
	const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
		null,
	);
	const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
	const [districtOpen, setDistrictOpen] = useState(false);
	const [cellOpen, setCellOpen] = useState(false);

	const { data: districts = [], isLoading: districtsLoading } =
		useDistrictsQuery();
	const { data: cells = [], isLoading: cellsLoading } =
		useAssignableCellsQuery(selectedDistrict?.id ?? personFlow.district_id);

	const { mutateAsync: assignDistrict, isPending: isAssigningDistrict } =
		useAssignDistrictMutation(flow_id);
	const { mutateAsync: assignCell, isPending: isAssigningCell } =
		useAssignCellMutation(flow_id);
	const qc = useQueryClient();

	const isPending = isAssigningDistrict || isAssigningCell;

	// Pre-populate from existing assignments when dialog opens
	useEffect(() => {
		if (visible) {
			if (personFlow.district_id) {
				setSelectedDistrict({
					id: personFlow.district_id,
					name:
						personFlow.district_name ??
						String(personFlow.district_id),
				});
			}
			if (personFlow.assigned_cell_id) {
				setSelectedCell({
					id: personFlow.assigned_cell_id,
					cell_name:
						personFlow.cell_name ??
						String(personFlow.assigned_cell_id),
				});
			}
		} else {
			setSelectedDistrict(null);
			setSelectedCell(null);
			setDistrictOpen(false);
			setCellOpen(false);
		}
	}, [visible]);

	const personPayload = [
		{
			id: Number(personFlow.p__id),
			full_legal_name: personFlow.p__full_legal_name ?? "",
		},
	];
	const flowPayload = { id: flow_id, title: flow_title };

	const handleAssign = async () => {
		if (!selectedDistrict && !selectedCell) {
			Alert.alert(
				"Nothing selected",
				"Please select at least a district or cell.",
			);
			return;
		}
		try {
			const results = [];
			if (selectedDistrict) {
				results.push(
					await assignDistrict({
						people: personPayload,
						flow: flowPayload,
						district: {
							id: selectedDistrict.id!,
							name: selectedDistrict.name!,
						},
					}),
				);
			}
			if (selectedCell) {
				results.push(
					await assignCell({
						people: personPayload,
						flow: flowPayload,
						cell: {
							id: selectedCell.id!,
							cell_name: selectedCell.cell_name,
						},
					}),
				);
			}
			if (results.every((r) => r.success)) {
				qc.invalidateQueries({ queryKey: ["peopleFlow"] });
				onDismiss();
			}
		} catch {
			Alert.alert("Error", "Failed to assign district/cell.");
		}
	};

	return (
		<Modal visible={visible} transparent animationType="slide">
			<View className="flex-1 bg-black/50 justify-end">
				<View
					className="bg-white rounded-t-2xl max-h-[85%] h-full"
					style={{ flexDirection: "column" }}
				>
					{/* Header */}
					<View className="px-5 pt-5 pb-3">
						<Text className="text-lg text-text font-bold">
							Assign District / Cell
						</Text>
						<Text
							className="text-sm text-gray-500"
							numberOfLines={1}
						>
							{personFlow.p__full_legal_name}
						</Text>
					</View>

					{/* Current assignment strip */}
					{(personFlow.district_name || personFlow.cell_name) && (
						<View className="mx-5 mb-3 bg-gray-50 rounded-lg px-3 py-2 flex-row gap-3 flex-wrap">
							{personFlow.district_name && (
								<View className="flex-row items-center gap-1">
									<MapPinIcon size={12} color="#9ca3af" />
									<Text className="text-xs text-gray-500">
										{personFlow.district_name}
									</Text>
								</View>
							)}
							{personFlow.cell_name && (
								<View className="flex-row items-center gap-1">
									<CircleIcon size={12} color="#9ca3af" />
									<Text className="text-xs text-gray-500">
										{personFlow.cell_name}
									</Text>
								</View>
							)}
						</View>
					)}

					{/* Dropdowns */}
					<View className="flex-1 px-5">
						{showDistrictTab && (
							<DistrictDropdown
								districts={districts}
								selected={selectedDistrict}
								onSelect={(d) => {
									setSelectedDistrict(d);
									setDistrictOpen(false);
									// Clear cell if it no longer belongs to the new district
									if (
										selectedCell &&
										!cells.find(
											(c) => c.id === selectedCell.id,
										)
									) {
										setSelectedCell(null);
									}
								}}
								onClear={() => {
									setSelectedDistrict(null);
									setSelectedCell(null);
								}}
								isOpen={districtOpen}
								onToggle={() => {
									setDistrictOpen((o) => !o);
									setCellOpen(false);
								}}
								isLoading={districtsLoading}
							/>
						)}

						{showCellTab && (
							<CellDropdown
								cells={cells}
								selected={selectedCell}
								onSelect={(c) => {
									setSelectedCell(c);
									setCellOpen(false);
								}}
								onClear={() => setSelectedCell(null)}
								isOpen={cellOpen}
								onToggle={() => {
									setCellOpen((o) => !o);
									setDistrictOpen(false);
								}}
								isLoading={cellsLoading}
							/>
						)}
					</View>

					<AssignDialogFooter
						onCancel={onDismiss}
						onConfirm={handleAssign}
						isPending={isPending}
						disabled={!selectedDistrict && !selectedCell}
					/>
				</View>
			</View>

			<Toast config={toastConfig} />
		</Modal>
	);
};

export default AssignDistrictCellDialog;
