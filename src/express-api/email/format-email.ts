export const formatEmail = (email?: string) => {
	if (!email) return ''

	return email.trim().toLowerCase().replace(/[^0-9a-zA-Z@]/g, '');
}
