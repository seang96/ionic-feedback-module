import { Device } from "@ionic-native/device/ngx";
import { AppInfo } from "./app-info.model";

export class FeedbackData {
	public timestamp: string;
	public category: string;
	public message: string;
	public name: string;
	public email: string;
	public deviceInfo: Device | undefined;
	public appInfo: AppInfo | undefined;
	public logMessages: string[] | undefined;
}
