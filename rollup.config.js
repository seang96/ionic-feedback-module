import typescript from 'rollup-plugin-typescript2';
 
export default {
    input: './src/index.ts',
    output: {
    	format: "umd",
    	name: "./dist/index.js"
    },
    external: [
		'@angular/core',
		'@angular/common',
		'@angular/cli',
		'@ionic-native/app-version',
		'@ionic-native/device',
		'ionic-angular'
	],
    plugins: [
        typescript(/*{ plugin options }*/)
    ]
}