export function daysAgo(dateInput: string | Date | null): string {
	if (!dateInput) return "-";

	const date = new Date(dateInput);
	if (isNaN(date.getTime())) return "-";

	const today = new Date();
	const diffTime = today.getTime() - date.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Yesterday";
	return `${diffDays} days ago`;
}

export function daysAgoTextColor(dateInput: string | Date | null): string {
	if (!dateInput) return "text-gray-400";

	const date = new Date(dateInput);
	if (isNaN(date.getTime())) return "text-gray-400";

	const today = new Date();
	const diffTime = today.getTime() - date.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays <= 1) return "text-green-500";
	if (diffDays <= 30) return "text-yellow-500";
	if (diffDays <= 90) return "text-orange-500";
	return "text-red-500";
}
