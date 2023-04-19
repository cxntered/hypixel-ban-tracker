import { SlashCommandBuilder, CommandInteraction, REST, Routes } from 'discord.js';
import { config } from './config';
import fs from 'node:fs';
import path from 'node:path';

interface Command {
	data: SlashCommandBuilder;
	execute: (interaction: CommandInteraction) => Promise<void>;
	help: {
		category: string;
		usage: string;
		example: string;
	};
}

(async () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const commands: any = [];

	const commandFiles = fs.readdirSync(path.resolve(__dirname, '../commands')).filter((file) => file.endsWith('.ts'));
	for (const file of commandFiles) {
		const command = await import(path.resolve(__dirname, `../commands/${file}`));
		commands.push(command.default);
	}

	const rest = new REST({ version: '10' }).setToken(config('discord.token'));

	// deploy commands
	(async () => {
		try {
			console.info(`Started deploying ${commands.length} production slash commands.`);

			const commandData = commands.map((command: Command) => command.data);

			await rest.put(Routes.applicationCommands(config('discord.clientID')), { body: commandData });

			console.info(`Successfully deployed ${commands.length} production slash commands.`);
			process.exit();
		} catch (error) {
			console.error(error);
			process.exit();
		}
	})();
})();
