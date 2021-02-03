export type NotificationTemplateProp = {
	date: string,
	performerAccountUrl: string,
	performerAccountName: string,
	avatar: string,
	message: string,
	relatedEntityUrl: string,
	relatedEntityName: string
}

export type ConfirmationProp = {
	link: string,
	message: string,
	image?: string,
	buttonText?: string
}

export type FeedTemplateProp = {
	ownerName: string,
	ownerLink: string,
	avatar: string
	spaceName: string,
	spaceLink: string,
	postName: string,
	postLink: string,
	postBody: string,
	date: string
}