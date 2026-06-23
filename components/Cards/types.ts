export interface CardCellGroupProps {
	id: number;
	avatarInitials?: string;
	avatarUrl?: string;
	title: string;
	meetingDay?: string;
	meetingTime?: string;
	location?: string;
	leaderName?: string;
	actionLabel?: string;
	onActionPress: () => void;
	isLoading?: boolean;
}

export interface InfoRowProps {
	icon: React.ReactNode;
	value: string;
	bold?: boolean;
}