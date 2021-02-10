export const formattingEmail = (email?: string) => {
	if (!email) return ''

	return email.trim().toLowerCase().replace(/[-+.^:;`'",_?]/g, '');
}
