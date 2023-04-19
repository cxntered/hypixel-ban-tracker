import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { QuickDB } from 'quick.db';

const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder().setName('unsubscribe').setDescription('Unsubscribes channel from the ban tracker'),
	async execute(interaction: CommandInteraction) {
		await db.pull('subscribedChannels', interaction.channelId);

		const embed = new EmbedBuilder()
			.setTitle('Success')
			.setColor('#2b2d31')
			.setDescription('This channel has been unsubscribed from the ban tracker.');
		interaction.reply({ embeds: [embed] });
	}
};
