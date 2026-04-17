export type ReturnVal = {
	success: boolean;
	message?: string;
	data?: Record<string, any>;
	meta?: Record<string, any>;
	err_code?: string;
	status_code?: number;
};
