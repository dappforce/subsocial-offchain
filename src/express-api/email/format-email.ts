export const formatEmail = (email?: string) => {
	if (!email) return ''

	const [ username, domain ] = email
		.trim()
		.toLowerCase()
		.split('@')

	return `${username.replace(/[\W_]/g, '')}@${domain}`
}
