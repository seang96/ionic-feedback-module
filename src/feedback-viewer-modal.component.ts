import { Component, OnInit } from "@angular/core";

import { AlertController, LoadingController, ModalController, NavParams, Platform } from "@ionic/angular";

import { Device } from "@ionic-native/device/ngx";
import { AppInfo } from "./app-info.model";
import { AttachmentState } from "./attachment-state.model";
import { FeedbackViewerTranslation } from "./feedback-viewer-translation.model";
import { FeedbackViewerModalManager } from './feedback-viewer-modal.manager';

/**
 * Ionic modal showing FeedbackViewerComponent.
 */
@Component({
	selector: "ionic-feedback-viewer-modal",
	template: `
<ion-header>
	<ion-toolbar color="primary">
		<ion-title>{{ getTranslation().title }}</ion-title>
		<ion-buttons slot="start">
			<ion-button *ngIf="!(this.platform.is('android') && this.platform.is('windows'))" (click)="onClose()">
				{{ getTranslation().cancel }}
			</ion-button>
			<ion-button icon-only *ngIf="this.platform.is('android') && this.platform.is('windows')" (click)="onClose()">
				<ion-icon name="close"></ion-icon>
			</ion-button>
		</ion-buttons>
		<ion-buttons slot="primary">
			<ion-button (click)="onSend()" [disabled]="sendDisabled">
				{{ getTranslation().send }}
			</ion-button>
		</ion-buttons>
	</ion-toolbar>
</ion-header>
<ion-content>

	<ion-list>
		<ion-item *ngIf="showCategories">
			<ion-select [(ngModel)]="category" interface="popover">
				<ion-select-option *ngFor="let c of categories" [value]="c">{{c}}</ion-select-option>
			</ion-select>
		</ion-item>

		<ion-item>
			<ion-textarea rows="6" placeholder="{{ getTranslation().message }}" [(ngModel)]="message"></ion-textarea>
		</ion-item>

		<ion-item>
			<ion-input type="text" placeholder="{{ getTranslation().name }}" [(ngModel)]="name"></ion-input>
		</ion-item>
		<ion-item>
			<ion-input type="email" placeholder="{{ getTranslation().email }}" [(ngModel)]="email"></ion-input>
		</ion-item>
	</ion-list>

	<ion-card *ngIf="showDeviceInfo">
		<ion-card-header>
			<ion-item>
				<ion-label>{{ getTranslation().includeDeviceInfo }}</ion-label>
				<ion-checkbox [(ngModel)]="includeDeviceInfo"></ion-checkbox>
			</ion-item>
		</ion-card-header>
		<ion-list *ngIf="includeDeviceInfo">
			<ion-item>
				<div item-left>{{ getTranslation().manufacturer }}: </div>
				<div item-right text-right>{{deviceInfo.manufacturer}}</div>
			</ion-item>
			<ion-item>
				<div item-left>{{ getTranslation().model }}: </div>
				<div item-right text-right>{{deviceInfo.model}}</div>
			</ion-item>
			<ion-item>
				<div item-left>{{ getTranslation().uuid }}: </div>
				<div item-right text-right>{{deviceInfo.uuid}}</div>
			</ion-item>
			<ion-item>
				<div item-left>{{ getTranslation().serial }}: </div>
				<div item-right text-right>{{deviceInfo.serial}}</div>
			</ion-item>
			<ion-item>
				<div item-left>{{ getTranslation().platform }}: </div>
				<div item-right text-right>{{deviceInfo.platform}}</div>
			</ion-item>
			<ion-item>
				<div item-left>{{ getTranslation().version }}: </div>
				<div item-right text-right>{{deviceInfo.version}}</div>
			</ion-item>
			<ion-item>
				<div item-left>{{ getTranslation().cordova }}: </div>
				<div item-right text-right>{{deviceInfo.cordova}}</div>
			</ion-item>
			<ion-item>
				<div item-left>{{ getTranslation().isVirtual }}: </div>
				<div item-right text-right>{{deviceInfo.isVirtual}}</div>
			</ion-item>
		</ion-list>
	</ion-card>

	<ion-card *ngIf="showAppInfo">
		<ion-card-header>
			<ion-item>
				<ion-label>{{ getTranslation().includeAppInfo }}: </ion-label>
				<ion-checkbox [(ngModel)]="includeAppInfo"></ion-checkbox>
			</ion-item>
		</ion-card-header>
		<ion-list *ngIf="includeAppInfo">
			<ion-item>
				<div item-left>{{ getTranslation().appName }}: </div>
				<div item-right text-right>{{appInfo.appName}}</div>
			</ion-item>
			<ion-item>
				<div item-left>{{ getTranslation().packageName }}: </div>
				<div item-right text-right>{{appInfo.packageName}}</div>
			</ion-item>
			<ion-item>
				<div item-left>{{ getTranslation().versionCode }}: </div>
				<div item-right text-right>{{appInfo.versionCode}}</div>
			</ion-item>
			<ion-item>
				<div item-left>{{ getTranslation().versionNumber }}: </div>
				<div item-right text-right>{{appInfo.versionNumber}}</div>
			</ion-item>
		</ion-list>
	</ion-card>

	<ion-card *ngIf="showLogMessages">
		<ion-card-header>
			<ion-item>
				<ion-label>{{ getTranslation().includeLogMessages }}</ion-label>
				<ion-checkbox [(ngModel)]="includeLogMessages"></ion-checkbox>
			</ion-item>
		</ion-card-header>
	</ion-card>

</ion-content>
`,
})
export class FeedbackViewerModalComponent implements OnInit {

	public timestamp: string;
	public showCategories: boolean;
	public category: string;
	public categories: string[];
	public message: string;
	public name: string;
	public email: string;
	public showDeviceInfo: boolean;
	public includeDeviceInfo: boolean;
	public showAppInfo: boolean;
	public includeAppInfo: boolean;
	public appInfo: AppInfo;
	public showLogMessages: boolean;
	public includeLogMessages: boolean;
	public logMessages: string[];

	public get sendDisabled(): boolean {
		return typeof this.message === "undefined" || this.message.length === 0;
	}

	/**
	 * Language to be used for the modal.
	 * Currently supported: en, de
	 */
	private language: string;

	/**
	 * Translation to be used for the modal.
	 * If specified, the language is ignored.
	 */
	private translation: FeedbackViewerTranslation;

	private translations: { [language: string]: FeedbackViewerTranslation; };

	constructor(
		private modalController: ModalController,
		navParams: NavParams,
		private alertController: AlertController,
		private loadingController: LoadingController,
		private deviceInfo: Device,
		private platform: Platform,
		private feedbackViewerModalManager: FeedbackViewerModalManager) {

		this.categories = navParams.get("categories");
		if (Array.isArray(this.categories) && this.categories.length > 0) {
			this.showCategories = true;
			this.category = this.categories[0];
		} else {
			this.showCategories = false;
		}

		const attachDeviceInfo: AttachmentState = navParams.get("attachDeviceInfo");
		this.includeDeviceInfo = attachDeviceInfo === AttachmentState.Yes || attachDeviceInfo === AttachmentState.Ask;
		this.showDeviceInfo = attachDeviceInfo === AttachmentState.Ask;

		const attachAppInfo: AttachmentState = navParams.get("attachAppInfo");
		this.includeAppInfo = attachAppInfo === AttachmentState.Yes || attachAppInfo === AttachmentState.Ask;
		this.showAppInfo = attachAppInfo === AttachmentState.Ask;

		this.logMessages = navParams.get("logMessages");
		const attachLogMessages: AttachmentState = navParams.get("attachLogMessages");
		this.includeLogMessages = attachLogMessages === AttachmentState.Yes || attachLogMessages === AttachmentState.Ask;
		this.showLogMessages = attachLogMessages === AttachmentState.Ask;

		this.timestamp = new Date().toISOString();
		this.name = navParams.get("name")
		this.email = navParams.get("email");

		this.language = navParams.get("language");
		this.translation = navParams.get("translation");
	}

	/**
	 * Initializes the FeedbackViewerModalComponent.
	 * It configures the supported translations.
	 */
	public ngOnInit(): void {
		// prepare translations
		this.translations = {};
		// tslint:disable-next-line:no-string-literal
		this.translations["en"] = {
			// tslint:disable:object-literal-sort-keys
			cancel: "Cancel",
			email: "Email",
			errorSending: "Could not send feedback",
			includeAppInfo: "Include App Info",
			includeDeviceInfo: "Include Device Info",
			includeLogMessages: "Include Log",
			includeScreenshot: "Include Screenshot",
			message: "Message",
			name: "Name",
			ok: "OK",
			send: "Send",
			title: "Feedback",

			manufacturer: "Manufacturer",
			model: "Model",
			uuid: "UUID",
			serial: "Serial",
			platform: "Platform",
			version: "Version",
			cordova: "Cordova",
			isVirtual: "IsVirtual",

			appName: "AppName",
			packageName: "PackageName",
			versionCode: "VersionCode",
			versionNumber: "VersionNumber",
			// tslint:enable:object-literal-sort-keys
		};
		// tslint:disable-next-line:no-string-literal
		this.translations["de"] = {
			// tslint:disable:object-literal-sort-keys
			cancel: "Abbrechen",
			email: "Email",
			errorSending: "Feedback konnte nicht gesendet werden",
			includeAppInfo: "App Info einschließen",
			includeDeviceInfo: "Geräte Info einschließen",
			includeLogMessages: "Log einschließen",
			includeScreenshot: "Screenshot einschließen",
			message: "Nachricht",
			name: "Name",
			ok: "OK",
			send: "Senden",
			title: "Feedback",

			manufacturer: "Hersteller",
			model: "Modell",
			uuid: "UUID",
			serial: "Seriennummer",
			platform: "Plattform",
			version: "Version",
			cordova: "Cordova",
			isVirtual: "Virtuell",

			appName: "Appname",
			packageName: "Packetname",
			versionCode: "Versionscode",
			versionNumber: "Versionsnummer",
			// tslint:enable:object-literal-sort-keys
		};
	}

	/**
	 * Eventhandler called by Ionic when the modal is opened.
	 */
	public ionViewDidEnter() {
	}

	/**
	 * Eventhandler called when the cancel button is clicked.
	 */
	public onClose(): void {
		this.modalController.dismiss();
	}

	public async onSend(): Promise<void> {
		let loading : any;
		try {
			loading = await this.loadingController.create();
			await loading.present();

			await this.feedbackViewerModalManager.sendFeedback(
				this.timestamp,
				this.category,
				this.message,
				this.name,
				this.email,
				this.includeDeviceInfo ? this.deviceInfo : undefined,
				this.includeAppInfo ? this.appInfo : undefined,
				this.includeLogMessages ? this.logMessages : undefined,
			);
			await loading.dismiss();
			this.modalController.dismiss();
		} catch (e) {
			if (loading)
				await loading.dismiss();
			let alert = await this.alertController.create({
				buttons: [this.getTranslation().ok],
				subHeader: this.getTranslation().errorSending,
				header: this.getTranslation().title,
			});
			await alert.present();
		}
	}

	/**
	 * Helper method returning the current translation:
	 * - the property translation if defined
	 * - the translation according property language if valid
	 * - English translation, otherwise
	 */
	public getTranslation(): FeedbackViewerTranslation {
		if (typeof this.translation !== "undefined") {
			return this.translation;
		} else if (typeof this.language !== "undefined" && typeof this.translations[this.language] === "object") {
			return this.translations[this.language];
		} else {
			// tslint:disable-next-line:no-string-literal
			return this.translations["en"];
		}
	}
}
