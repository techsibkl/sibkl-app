// hooks/useAbility.ts

import { useAuthStore } from "@/stores/authStore";

export const useAbility = () => {
	return useAuthStore((state) => state.ability);
};
