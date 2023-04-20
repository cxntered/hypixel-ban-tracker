import { ChannelType, Client, EmbedBuilder, GatewayIntentBits, time } from 'discord.js';
import { QuickDB } from 'quick.db';
import { config } from './utils/config';
import fetch from 'cross-fetch';
import fs from 'node:fs';
import path from 'node:path';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const db = new QuickDB();

// load events
const eventsPath = path.join(__dirname, './events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.ts'));

(async () => {
	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = await import(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
})();

// little helper function to make 'player' plural if needed
const pluralPlayer = (num: number) => (num === 1 ? 'player' : 'players');

// function to grab all subscribed channels and send the embed to them
const send = async (embed: EmbedBuilder) => {
	const subscribedChannels = await db.get('subscribedChannels');

	if (!Array.isArray(subscribedChannels)) {
		return;
	}

	for (const channelId of subscribedChannels) {
		const channel = client.channels.cache.get(channelId);
		if (!channel || channel.type !== ChannelType.GuildText) {
			continue;
		}
		channel.send({ embeds: [embed] });
	}
};

// actual ban tracker
let watchdogBans = 0;
let staffBans = 0;

setInterval(async () => {
	const res = await fetch('https://api.plancke.io/hypixel/v1/punishmentStats', {
		method: 'GET',
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
		}
	}).then((res) => res.json());

	const newWatchdogBans = res.record.watchdog_total;
	const newStaffBans = res.record.staff_total;

	// if statement to check if its the first time running the function
	if (watchdogBans !== 0 && staffBans !== 0) {
		const watchdogBanDifference = newWatchdogBans - watchdogBans;
		const staffBanDifference = newStaffBans - staffBans;

		// if there are new watchdog bans, send an embed to all subscribed channels
		if (watchdogBanDifference > 0) {
			const embed = new EmbedBuilder()
				.setAuthor({ name: `Watchdog banned ${watchdogBanDifference} ${pluralPlayer(watchdogBanDifference)}.` })
				.setColor('#ffff00')
				.setDescription(`${time(new Date(), 'R')}`);
			send(embed);
		}

		// if there are new staff bans, send an embed to all subscribed channels
		if (staffBanDifference > 0) {
			const embed = new EmbedBuilder()
				.setAuthor({ name: `Staff banned ${staffBanDifference} ${pluralPlayer(staffBanDifference)}.` })
				.setColor('#ff0000')
				.setDescription(`${time(new Date(), 'R')}`);
			send(embed);
		}
	}

	// update the overall ban counts
	watchdogBans = newWatchdogBans;
	staffBans = newStaffBans;
}, 100); // 100ms = 0.1s, you can change this to not get rate limited

// login to discord
const token = config('discord.token');
client.login(token).catch(() => {
	console.error('Something went wrong while connecting to Discord.');
});
