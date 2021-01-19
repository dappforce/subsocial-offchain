export type NotificationTemplateProp = {
	date: string,
	performerAccountUrl: string,
	performerAccountName: string,
	avatar: string,
	message: string,
	relatedEntityUrl: string,
	relatedEntityName: string
}

export type ConfirmationLink = {
	link: string,
	image?: string
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