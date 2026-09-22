import {
	Calendar,
	ClipboardList,
	FunnelIcon,
	GraduationCap,
} from "lucide-react-native";
import React from "react";
import { Dimensions } from "react-native";

export const { width: SCREEN_W } = Dimensions.get("window");
export const CARD_W = Math.round(SCREEN_W * 0.62);

export type FeatureItem = {
	key: string;
	Icon: React.FC<any>;
	title: string;
	description: string;
	color: string;
	bgColor: string;
	route?: string;
};

export const UNLOCK_FEATURES: FeatureItem[] = [
	{
		key: "cellAttendance",
		Icon: ClipboardList,
		title: "Cell Attendance",
		description: "Check-in and track attendance for your cell group.",
		color: "#10B981",
		bgColor: "#ECFDF5",
		route: "/(app)/cells",
	},
	{
		key: "cellFollowUp",
		Icon: FunnelIcon,
		title: "Guest Follow-up",
		description:
			"Follow-up on guests with automated tools and status tracking.",
		color: "#8B5CF6",
		bgColor: "#F5F3FF",
		route: "/(app)/flows",
	},
	{
		key: "leadersPage",
		Icon: GraduationCap,
		title: "Leader's Page",
		description:
			"Browse and download cell notes, cell videos, worship videos, training notes, policies and more.",
		color: "#F59E0B",
		bgColor: "#FFFBEB",
		route: "/(app)/leaders",
	},
	{
		key: "events",
		Icon: Calendar,
		title: "Events",
		description:
			"Stay updated on upcoming church events. Quick sign-up for events.",
		color: "#EF4444",
		bgColor: "#FEF2F2",
		route: "/(app)/events",
	},
];
