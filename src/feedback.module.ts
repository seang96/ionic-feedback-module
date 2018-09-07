import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from "@ionic/angular";

import { FeedbackViewerModalComponent } from "./feedback-viewer-modal.component";
import { FeedbackViewerModalManager } from "./feedback-viewer-modal.manager";

import { Device } from '@ionic-native/device/ngx';
import { AppVersion } from "@ionic-native/app-version/ngx";

@NgModule({
	declarations: [
		FeedbackViewerModalComponent,
	],
	entryComponents: [
		FeedbackViewerModalComponent,
	],
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
	],
	providers: [
		FeedbackViewerModalManager,
		Device,
		AppVersion,
	],
})
export class FeedbackModule { }
