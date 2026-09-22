import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns milliseconds remaining until launchDate.
 * Returns 0 when no date is set or the date has passed. Ticks every second.
 */
export function useMsLeft(launchDate: string | null): number {
	const [msLeft, setMsLeft] = useState<number>(() => {
		if (!launchDate) return 0;
		return Math.max(0, new Date(launchDate).getTime() - Date.now());
	});

	useEffect(() => {
		if (!launchDate) {
			setMsLeft(0);
			return;
		}
		const tick = () =>
			setMsLeft(Math.max(0, new Date(launchDate).getTime() - Date.now()));
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [launchDate]);

	return msLeft;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CountdownDisplay = ({ msLeft }: { msLeft: number }) => {
	const d = Math.floor(msLeft / (1000 * 60 * 60 * 24));
	const h = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
	const m = Math.floor((msLeft / (1000 * 60)) % 60);
	const s = Math.floor((msLeft / 1000) % 60);
	const pad = (n: number) => String(n).padStart(2, "0");

	return (
		<View className="flex-row justify-center gap-3 mb-5">
			{[
				{ value: pad(d), label: "Days" },
				{ value: pad(h), label: "Hrs" },
				{ value: pad(m), label: "Min" },
				{ value: pad(s), label: "Sec" },
			].map(({ value, label }) => (
				<View key={label} className="items-center">
					<View className="w-[68px] h-16 bg-amber-50 rounded-2xl border border-amber-100 items-center justify-center">
						<Text className="text-2xl font-bold text-amber-800">{value}</Text>
					</View>
					<Text className="text-xs text-gray-400 mt-1.5 font-regular">{label}</Text>
				</View>
			))}
		</View>
	);
};
