const Discord = require('discord.js');
const { Client } = require('discord.js-ext');
let client = new Discord.Client();
client = Object.assign(client, new Client(client));
client.config = require('./config');

client.on('ready', () => {
    console.log(client.user.username + ' online.\nCurrently on ' + client.guilds.size + ' server(s) !');
    client.user.setPresence( { game: { name: '🎵 type ' + client.config.BOT_PREFIX + 'help to display my command list. 🎵' } });
});

client.on('message', (message) => {
    if (!message.guild || message.author.bot) { return; }
    if (!message.channel.permissionsFor(client.user.id).has("SEND_MESSAGES")) { return; }
    if(!message.content || !message.content.startsWith(client.config.BOT_PREFIX)) { return; }

    let command = message.content.slice(client.config.BOT_PREFIX.length).split(' ').shift();
    let args = message.content.split(' ').slice(1);
    switch (command) {
        case 'join':
            let channelName;
            if (!args.join(' ')) {
                if (message.member.voiceChannel) { channelName = message.member.voiceChannel.name; }
                else { return message.channel.send('⚠ You must include a channelID or channelName.'); }
            } else {
                channelName = args.join(' ');
            }
            client.utils.findChannel(message, channelName, 'voice')
                .then((channel) => {
                   client.playermanager.join(channel.id)
                       .then(() => {
                           return message.channel.send('✅ I successfully joined **' + channel.toString() + '** !');
                       })
                       .catch((err) => {
                           if (err) { return message.channel.send('❌ Uh, an error has occured, I\'m sorry for the inconvenience. Try later.'); }
                       });
                })
                .catch((err) => {
                    if (err) { return message.channel.send('❌ Uh, an error has occured, I\'m sorry for the inconvenience. Try later.'); }
                });
            break;
        case 'leave':
            let channel = message.guild.me.voiceChannel;
            if (!channel) { return message.channel.send('⚠ I\'m not connected in any channel.'); }
            client.playermanager.leave(channel.id)
                .then(() => {
                    return message.channel.send('✅ I successfully leaved **' + channel.toString() + '** !');
                })
                .catch((err) => {
                    if (err) { return message.channel.send('❌ Uh, an error has occured, I\'m sorry for the inconvenience. Try later.'); }
                });
            break;
        case 'play':
            let ch = message.guild.me.voiceChannel;
            if (!args.join(' ')) { return message.channel.send('⚠ You must include a YouTube link or Youtube Video ID.'); }
            if (!ch) { return message.channel.send('⚠ I\'m not connected in any channel. Try `' + client.config.BOT_PREFIX + 'join` to join the bot.'); }
            client.playermanager.playYouTube(ch.id, args.join(' '))
                .then(() => {
                    return message.channel.send('✅ I play now **' + args.join(' ') + '** !');
                })
                .catch((err) => {
                    if (err) { return message.channel.send('❌ Uh, an error has occured, I\'m sorry for the inconvenience. Try later.'); }
                });
            break;
        case 'help':
            message.channel.send('Here\'s my all commands: `join`, `leave`, `play`');
            break;
    }
});

client.on('error', console.error);

client.login(client.config.BOT_TOKEN);