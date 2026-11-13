/**
 * Email shown on complete-profile after an account claim.
 * The Firebase login address wins when the user just chose one (SMS claim
 * often has no directory email). An empty login address keeps the directory
 * value so email verification is unchanged.
 */
export function resolveClaimedProfileEmail(
	directoryEmail?: string | null,
	accountEmail?: string | null,
): string {
	const account = accountEmail?.trim() ?? "";
	if (account) return account;
	return directoryEmail?.trim() ?? "";
}
