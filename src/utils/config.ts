import path from 'node:path';

export interface Config {
	discord: {
		/**
		 * Discord bot token
		 */
		token: string;
		/**
		 * Discord bot Client ID
		 */
		clientID: string;
	};
}

const loadConfig = () => {
	try {
		return require(path.resolve(__dirname, '../../config.js'));
	} catch (err) {
		throw new Error('No config file detected!');
	}
};

let cfg: Config;

export const config = (key: string, { required = true } = {}) => {
	if (cfg === undefined) {
		cfg = loadConfig();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const value = key.split('.').reduce((a: any, b) => (a === null || a === void 0 ? void 0 : a[b]), cfg) || undefined;

	const isValueDefined = value !== undefined && value !== '';

	if (!isValueDefined) {
		if (required) throw new Error(`Missing required environment variable: ${key} \n Add ${key} to your config`);
	}

	return value;
};
