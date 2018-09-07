export default {
	format: 'umd',
	moduleName: 'feedback-module',
	external: [
		'@angular/core',
		'@angular/common',
		'@angular/common/http',
		'@ionic-native/app-version',
		'@ionic-native/device',
		'@ionic-native/screenshot',
		'@ionic-native/shake',
		'ionic-angular',
		'ionic-configuration-service',
		'ionic-logging-service',
		'moment'
	],
	onwarn: (warning) => {
		const skip_codes = [
			'THIS_IS_UNDEFINED',
			'MISSING_GLOBAL_NAME',
			'DEPRECATED_OPTIONS'
		];
		if (skip_codes.indexOf(warning.code) != -1) return;
		console.error(warning);
	}
}
