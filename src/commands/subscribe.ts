import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { QuickDB } from 'quick.db';

const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder().setName('subscribe').setDescription('Subscribes channel to the ban tracker'),
	async execute(interaction: CommandInteraction) {
		const subscribedChannels = await db.get('subscribedChannels');
		if (!Array.isArray(subscribedChannels)) {
			await db.set('subscribedChannels', []);
		}

		if (!subscribedChannels || !subscribedChannels.includes(interaction.channelId)) {
			await db.push('subscribedChannels', interaction.channelId);

			const embed = new EmbedBuilder()
				.setTitle('Success')
				.setColor('#2b2d31')
				.setDescription('This channel has been subscribed to the ban tracker.');
			interaction.reply({ embeds: [embed] });
		} else {
			const embed = new EmbedBuilder()
				.setTitle('Error')
				.setColor('#2b2d31')
				.setDescription('This channel was already subscribed to the ban tracker.');
			interaction.reply({ embeds: [embed] });
		}
	}
};
