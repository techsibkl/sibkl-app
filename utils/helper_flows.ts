import { defaultFlowStatusAttrs } from "@/constants/const_flows";
import { FlowStatus, FlowStep } from "@/services/Flow/flow.types";

export function daysAgo(dateInput?: string | Date | null): string {
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

export function daysAgoTextColorNative(
	dateInput?: string | Date | null
): string {
	if (!dateInput) return "#9CA3AF"; // gray-400

	const date = new Date(dateInput);
	if (isNaN(date.getTime())) return "#9CA3AF";

	const today = new Date();
	const diffTime = today.getTime() - date.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays <= 1) return "#22C55E"; // green-500
	if (diffDays <= 30) return "#EAB308"; // yellow-500
	if (diffDays <= 90) return "#F97316"; // orange-500
	return "#EF4444"; // red-500
}

// New function for React Native
export function getStepStatusStyleNative(
	step_key?: string,
	steps?: { [key: string]: FlowStep }
) {
	const colorMap: { [key: string]: { bg: string; text: string } } = {
		gray: { bg: "#e8e8e8ff", text: "#6B7280" },
		yellow: { bg: "#FEF3C7", text: "#EAB308" },
		green: { bg: "#D1FAE5", text: "#15b850ff" },
		red: { bg: "#FEE2E2", text: "#EF4444" },
		blue: { bg: "#DBEAFE", text: "#3B82F6" },
		orange: { bg: "#FFEDD5", text: "#F97316" },
		purple: { bg: "#F3E8FF", text: "#A855F7" },
	};

	const step = steps && step_key ? steps[step_key] : null;
	if (!step || step.status == FlowStatus.NOT_STARTED) {
		return colorMap.gray;
	}

	const color =
		defaultFlowStatusAttrs[step.status || FlowStatus.NOT_STARTED].color;
	return colorMap[color] || colorMap.gray;
}

export function convertToWhatsApp(html: string) {
	const text = html
		.replace(/<p>\s*/g, "") // Remove opening <p> tags
		.replace(/<\/p>\s*/g, "\n") // Replace closing </p> with newline
		.replace(/<br\s*\/?>/g, "\n") // Replace <br> with newline
		.replace(/<strong>(.*?)<\/strong>/g, "*$1*") // Convert <strong> to *bold*
		.replace(/&nbsp;/g, " ") // Convert &nbsp; to space
		.replace(/&amp;/g, "&") // Convert &amp; to &
		.replace(/&lt;/g, "<") // Convert &lt; to <
		.replace(/&gt;/g, ">") // Convert &gt; to >
		.replace(/&quot;/g, '"') // Convert &quot; to "
		.replace(/&#39;/g, "'") // Convert HTML entity for apostrophe
		.trim();

	return text;
}
