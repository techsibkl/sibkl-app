// hooks/useAbility.ts

import { useAuthStore } from "@/stores/authStore";

export const useAbility = () => {
	const ability = useAuthStore((state) => state.ability);
	return { can: ability.can.bind(ability) };
};
