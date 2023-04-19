import { CommandInteraction, Events } from 'discord.js';
import { commands } from '../utils/commands';

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction: CommandInteraction) {
		if (!interaction.isChatInputCommand()) return;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const command: any = commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
};
