import { Collection } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const commands = new Collection();

(async () => {
	const commandFiles = fs.readdirSync(path.resolve(__dirname, '../commands')).filter((file) => file.endsWith('.ts'));
	for (const file of commandFiles) {
		const command = await import(path.resolve(__dirname, `../commands/${file}`));
		if ('data' in command && 'execute' in command) {
			commands.set(command.default.data.name, command.default);
		}
	}
})();

export { commands };
