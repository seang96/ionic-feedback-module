import { EventEmitter, Injectable } from "@angular/core";

import { AppVersion } from "@ionic-native/app-version/ngx";
import { Device } from "@ionic-native/device/ngx";
import { ModalController, Platform } from "@ionic/angular";
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { Pro } from '@ionic/pro';

import { AppInfo } from "./app-info.model";
import { AttachmentState } from "./attachment-state.model";
import { FeedbackConfiguration } from "./feedback-configuration.model";
import { FeedbackContact } from "./feedback-contact.model";
import { FeedbackViewerModalComponent } from "./feedback-viewer-modal.component";
import { FeedbackData } from "./feedback-data.model";
import { FeedbackViewerTranslation } from "./feedback-viewer-translation.model";

/**
 * Helper class which makes the usage of the FeedbackViewerModalComponent more comfortable.
 */
@Injectable()
export class FeedbackViewerModalManager {

	/**
	 * Event submitted when the modal gets closed.
	 */
	public modalClosed = new EventEmitter<void>();

	private configuration: FeedbackConfiguration;
	private contact: FeedbackContact = {};

	private modalIsOpen: boolean;

	private logMessages: string[];

	private _feedbackData = new Subject<FeedbackData>();
	feedbackDataChange$: Observable<FeedbackData> = this._feedbackData.asObservable();

	constructor(
		private platform: Platform,
		private modalController: ModalController,
		private appVersion: AppVersion,
		private device: Device) {
		this.modalIsOpen = false;
		this.logMessages = [];
	}

	/**
	 * Opens the modal.
	 * @param language language used for the modal. Currently the languages en and de are supported.
	 *                 If the given language is unknown or undefined, the given translation is used.
	 * @param translation translation for the labels in the modal.
	 * @param categories optional categories of the feedback.
	 * @param name name of the contact.
	 * @param email email address.
	 * @param attachScreenshot if true, a shot of the current screen will be attached.
	 * @param attachLogMessages shall the last log messages be attached.
	 * @param attachDeviceInfo if true, the device info will be attached.
	 * @param attachAppInfo if true, the app info will be attached.
	 * @returns Promise which gets resolved as soon as the modal is shown.
	 */
	public async openModal(
		language: string = this.configuration.language,
		translation: FeedbackViewerTranslation = this.configuration.translation,
		categories: string[] = this.configuration.categories,
		name: string | undefined = this.contact.name,
		email: string | undefined = this.contact.email,
		log: string[] = this.logMessages,
		attachDeviceInfo: AttachmentState = this.configuration.attachDeviceInfo,
		attachAppInfo: AttachmentState = this.configuration.attachAppInfo,
		attachLogMessages: AttachmentState = this.configuration.attachLogMessages): Promise<void> {

		// retrieve log messages (as soon as possible)
		let logMessages: string[] | undefined;
		if (attachLogMessages === AttachmentState.Ask || attachLogMessages === AttachmentState.Yes) {
			// thanks to slice(), the array is cloned
			logMessages = log.slice(0);
		}

		if (this.modalIsOpen) {
			throw new Error("FeedbackViewerModalComponent is already open");
		}

		try {
			this.modalIsOpen = true;

			// retrieve device info
			let deviceInfo: Device | undefined;
			if (attachDeviceInfo === AttachmentState.Ask || attachDeviceInfo === AttachmentState.Yes) {
				if (this.platform.is("cordova")) {
					deviceInfo = {
						cordova: this.device.cordova,
						isVirtual: this.device.isVirtual,
						manufacturer: this.device.manufacturer,
						model: this.device.model,
						platform: this.device.platform,
						serial: this.device.serial,
						uuid: this.device.uuid,
						version: this.device.version,
					};
				} else {
					attachDeviceInfo = AttachmentState.No;
				}
			}

			// retrieve app info
			let appInfo: AppInfo | undefined;
			if (attachAppInfo === AttachmentState.Ask || attachAppInfo === AttachmentState.Yes) {
				if (this.platform.is("cordova")) {
					appInfo = {
						appName: await this.appVersion.getAppName(),
						packageName: await this.appVersion.getPackageName(),
						versionCode: await this.appVersion.getVersionCode(),
						versionNumber: await this.appVersion.getVersionNumber(),
						ionicPro: {
							configuration: await Pro.deploy.getConfiguration(),
							currentVersion: await Pro.deploy.getCurrentVersion()
						}
					};
				} else {
					attachAppInfo = AttachmentState.No;
				}
			}

			const modal = await this.modalController.create({
				component: FeedbackViewerModalComponent,
				componentProps: {
					// tslint:disable:object-literal-sort-keys
					categories,
					name,
					email,
					attachLogMessages,
					logMessages,
					attachDeviceInfo,
					deviceInfo,
					attachAppInfo,
					appInfo,
					language,
					translation,
					// tslint:enable:object-literal-sort-keys
				}
			});
			modal.onDidDismiss().then(() => {
				this.onModalClosed();
			});
			await modal.present();
		} catch (e) {
			// something went wrong, so the modal is not open
			this.modalIsOpen = false;
			throw e;
		}
	}

	/**
	 * Callback called when the modal is closed.
	 */
	private onModalClosed(): void {
		this.modalIsOpen = false;
		this.modalClosed.emit();
	}


	public async sendFeedback(
		timestamp: string, category: string, message: string, name: string,
		email: string, deviceInfo: Device | undefined, appInfo: AppInfo | undefined,
		logMessages: string[] | undefined) {
		const feedbackData: FeedbackData = {
			appInfo,
			category,
			deviceInfo,
			email,
			logMessages,
			message,
			name,
			timestamp,
		};
		this._feedbackData.next(feedbackData);
	}

	public configure(configuration: any): void {
		// map enum values
		if (typeof configuration.attachLogMessages === "string") {
			configuration.attachLogMessages = AttachmentState[configuration.attachLogMessages as any] as any as AttachmentState;
		}
		if (typeof configuration.attachDeviceInfo === "string") {
			configuration.attachDeviceInfo = AttachmentState[configuration.attachDeviceInfo as any] as any as AttachmentState;
		}
		if (typeof configuration.attachAppInfo === "string") {
			configuration.attachAppInfo = AttachmentState[configuration.attachAppInfo as any] as any as AttachmentState;
		}

		this.configuration = configuration;
	}

	public updateContact(name: string, email: string) {
		this.contact = {name, email};
	}
}
