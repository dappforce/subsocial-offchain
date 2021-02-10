// FIXME: export these to JS libs
export const parseEmail = (email: string) => email?.trim().toLowerCase().split('@')

export const formatEmail = (email?: string) => {
	if (!email) return ''

	const [ username, domain ] = parseEmail(email)

	return `${username.replace(/[\W_]/g, '')}@${domain}`
}
