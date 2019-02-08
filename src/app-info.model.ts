import { Pro } from '@ionic/pro';

export class AppInfo {
	public appName: string;
	public packageName: string;
	public versionCode: string | number;
	public versionNumber: string;
	public ionicProConfiguration = Pro.deploy.getConfiguration();
}