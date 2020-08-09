require('dotenv').config({path: './auth.env'});

const tmi = require('tmi.js');
const discord = require('discord.js');
const fs = require('fs');

const { getUser } = require('./utils/twitchAPI.JS');

const users = JSON.parse(fs.readFileSync('src/utils/users.json', 'utf8'));

/** @type {import("discord.js").Client} */
const discordClient = new discord.Client();

/** @type {import("tmi.js").Client} */
const twitchClient = new tmi.Client({
	options: { debug: false },
	connection: { reconnect: true, secure: true },
    identity: { username: process.env.TWITCH_USERNAME, password: process.env.TWITCH_OAUTH },
    channels: [process.env.TWITCH_CHANNEL]
});

discordClient.login(process.env.DISCORD_TOKEN);
twitchClient.connect();

discordClient.on('ready', () =>{
    console.log('Discord started.');
});

twitchClient.on('connected', () =>{
    console.log('Twitch started.');
});

twitchClient.on('message', async (channel, user, message, self) => {

    if(self) return;

    const discordChannel = discordClient.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
    
    if(!users[user["user-id"]]){
        const userInfo = await getUser(user.username);

        await discordChannel.createWebhook(user["display-name"], {
            avatar: userInfo.profile_image_url,
        }).then(async (webhook) => {

            users[user["user-id"]] = {
                name: user.username,
                webhookID: webhook.id,
                webhookToken: webhook.token
            };
    
            await fs.writeFileSync('src/utils/users.json', JSON.stringify(users));
        
        }).catch((err) => { return console.error(err) });
    }

    const webhookID = users[user["user-id"]].webhookID;
    const webhookToken = users[user["user-id"]].webhookToken;

    const webhookClient = new discord.WebhookClient(webhookID, webhookToken);
    webhookClient.send(message);

});

twitchClient.on('ban', async (channel, username, reason) => {
    const discordChannel = discordClient.channels.cache.get(process.env.DISCORD_CHANNEL_ID);

    if(!users["punishment"]){

        await discordChannel.createWebhook("Punishment", {
            avatar: 'https://i.imgur.com/tRsH8Ag.png',
        }).then(async (webhook) => {

            users["punishment"] = {
                name: "punishment",
                webhookID: webhook.id,
                webhookToken: webhook.token
            };
    
            await fs.writeFileSync('src/utils/users.json', JSON.stringify(users));
        
        }).catch((err) => { return console.error(err) });
    }

    const webhookID = users["punishment"].webhookID;
    const webhookToken = users["punishment"].webhookToken;

    const webhookClient = new discord.WebhookClient(webhookID, webhookToken);
    webhookClient.send(`**${username} has been banned from the channel.**`);
});

twitchClient.on('timeout', async (channel, username, reason, duration) => {
    const discordChannel = discordClient.channels.cache.get(process.env.DISCORD_CHANNEL_ID);

    if(!users["punishment"]){

        await discordChannel.createWebhook("Punishment", {
            avatar: 'https://i.imgur.com/tRsH8Ag.png',
        }).then(async (webhook) => {

            users["punishment"] = {
                name: "punishment",
                webhookID: webhook.id,
                webhookToken: webhook.token
            };
    
            await fs.writeFileSync('src/utils/users.json', JSON.stringify(users));
        
        }).catch((err) => { return console.error(err) });
    }

    const webhookID = users["punishment"].webhookID;
    const webhookToken = users["punishment"].webhookToken;

    const webhookClient = new discord.WebhookClient(webhookID, webhookToken);
    webhookClient.send(`**${username} has been timed out for ${duration} seconds.**`);
});