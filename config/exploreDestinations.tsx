import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { usePeopleFlowAllQuery } from "@/hooks/Flows/useFlowsQuery";
import { useAuthStore } from "@/stores/authStore";
import { FeatureFlags } from "@/types/SystemConfig";
import { Href } from "expo-router";
import {
	FunnelIcon,
	GraduationCap,
	LucideIcon,
	Settings,
	Users,
} from "lucide-react-native";
import { useMemo } from "react";
import { Colors } from "@/constants/Colors";

export type ExploreDestinationId =
	| "people"
	| "followUp"
	| "leaders"
	| "settings";

export type ExploreDestinationDef = {
	id: ExploreDestinationId;
	title: string;
	defaultSubtitle: string;
	href: Href;
	featureFlag?: keyof FeatureFlags;
	Icon: LucideIcon;
	iconColor: string;
	iconWellColor: string;
};

export const EXPLORE_DESTINATIONS: ExploreDestinationDef[] = [
	{
		id: "people",
		title: "People",
		defaultSubtitle: "Directory",
		href: "/(app)/people",
		featureFlag: "people",
		Icon: Users,
		iconColor: Colors.gray[600],
		iconWellColor: Colors.gray[100],
	},
	{
		id: "followUp",
		title: "Follow-up",
		defaultSubtitle: "Assignments",
		href: "/(app)/flows",
		featureFlag: "guestFollowUp",
		Icon: FunnelIcon,
		iconColor: Colors.gray[600],
		iconWellColor: Colors.gray[100],
	},
	{
		id: "leaders",
		title: "Leaders",
		defaultSubtitle: "Resources",
		href: "/(app)/leaders",
		featureFlag: "leadersPage",
		Icon: GraduationCap,
		iconColor: Colors.gray[600],
		iconWellColor: Colors.gray[100],
	},
	{
		id: "settings",
		title: "Settings",
		defaultSubtitle: "Account & app",
		href: "/(app)/settings",
		Icon: Settings,
		iconColor: Colors.gray[600],
		iconWellColor: Colors.gray[100],
	},
];

export type ExploreDestinationItem = ExploreDestinationDef & {
	subtitle: string;
};

export const useExploreDestinations = (): ExploreDestinationItem[] => {
	const showPeople = useFeatureFlag("people");
	const showGuestFollowUp = useFeatureFlag("guestFollowUp");
	const showLeadersPage = useFeatureFlag("leadersPage");
	const { user, isGuest } = useAuthStore();
	const personId = user?.person?.id ?? -1;

	const { data: allPeople } = usePeopleFlowAllQuery();

	const assignedCount = useMemo(() => {
		if (!showGuestFollowUp || isGuest || personId <= 0) return 0;
		return (
			allPeople?.filter(
				(p) =>
					Number(p.assignee_id) === personId &&
					p.completed !== true,
			).length ?? 0
		);
	}, [allPeople, personId, showGuestFollowUp, isGuest]);

	const flagEnabled: Record<ExploreDestinationId, boolean> = {
		people: showPeople,
		followUp: showGuestFollowUp,
		leaders: showLeadersPage,
		settings: true,
	};

	return EXPLORE_DESTINATIONS.filter((d) => flagEnabled[d.id]).map((d) => {
		if (d.id === "followUp" && assignedCount > 0) {
			return {
				...d,
				subtitle: `${assignedCount} assigned`,
			};
		}
		return { ...d, subtitle: d.defaultSubtitle };
	});
};
