import { ActivityType, Client, Events } from 'discord.js';

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client: Client) {
		console.info(`Logged in as ${client.user?.tag}`);
		client.user?.setActivity('bans on Hypixel', { type: ActivityType.Watching });
	}
};
