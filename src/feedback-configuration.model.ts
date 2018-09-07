import { AttachmentState } from "./attachment-state.model";
import { FeedbackViewerTranslation } from "./feedback-viewer-translation.model";

export interface FeedbackConfiguration {

	isEnabled: boolean;

	appKey: string;
	appSecret: string;
	url: string;

	language: string;
	translation: FeedbackViewerTranslation;
	categories: string[];
	attachDeviceInfo: AttachmentState;
	attachAppInfo: AttachmentState;
	attachLogMessages: AttachmentState;
}
