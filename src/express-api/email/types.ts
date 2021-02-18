export type NotificationTemplateProp = {
	date: string,
	performerAccountName: string,
	relatedEntityUrl: string,
	avatar: string,
	message: string,
	relatedEntityName: string,
	image?: string
}

export type FeedTemplateProp = {
	ownerName: string,
	avatar: string
	spaceName: string,
	postName: string,
	postLink: string,
	postSummary: string,
	date: string,
	image?: string
}

export type ConfirmationProp = {
	link: string,
	message: string,
	image?: string,
	buttonText?: string
}


