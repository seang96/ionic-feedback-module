export default {
	format: 'umd',
	moduleName: 'feedback-module',
	external: [
		'@angular/core',
		'@angular/common',
		'@angular/cli',
		'@ionic-native/app-version',
		'@ionic-native/device',
		'ionic-angular'
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
