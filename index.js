const Discord = require('discord.js');
const { Client } = require('discord.js-ext');
let client = new Discord.Client();
client = Object.assign(client, new Client(client));
client.config = require('./config');
client.utils = Object.assign(client.utils, require('./helpers/utils'));

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

    let queue = client.utils.getCurrentQueue(client.config.BOT_QUEUES, message.guild.id);

    switch (command) {
        case 'join':
            let channelName;
            if (!args.join(' ')) {
                if (message.member.voiceChannel) { channelName = message.member.voiceChannel.name; }
                else { return message.channel.send('⚠ You must include a channelID or channelName.'); }
            } else { channelName = args.join(' '); }
            client.utils.findChannel(message, channelName, 'voice')
                .then((channel) => {
                   client.playermanager.join(channel.id)
                       .then(() => {
                           return message.channel.send('✅ I successfully joined **' + channel.toString() + '** !');
                       })
                       .catch((err) => {
                           if (err) { return message.channel.send('❌ Uh, an error has occured, I\'m sorry for the inconvenience. Try later.\n```JS\n' + err.message + '```'); }
                       });
                })
                .catch((err) => {
                    if (err) { return message.channel.send('❌ Uh, an error has occured, I\'m sorry for the inconvenience. Try later.\n```JS\n' + err.message + '```'); }
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
                    if (err) { return message.channel.send('❌ Uh, an error has occured, I\'m sorry for the inconvenience. Try later.\n```JS\n' + err.message + '```'); }
                });
            break;
        case 'play':
            let ch = message.guild.me.voiceChannel;
            if (!args.join(' ')) { return message.channel.send('⚠ You must include a YouTube link or Youtube Video ID.'); }
            if (!ch) { return message.channel.send('⚠ I\'m not connected in any channel. Try `' + client.config.BOT_PREFIX + 'join` to join the bot.'); }
            if (queue.length > 0) {
                queue.push({ link: args.join(' '), author: message.author.tag });
                return message.channel.send('☑ **<' + args.join(' ') + '>** is successfully added on the queue !')
            } else {
                queue.push({ link: args.join(' '), author: message.author.tag });
                client.utils.play(client, message, args.join(' '));
            }
            break;
        case 'pause':
            if (!message.guild.me.voiceChannel) { return message.channel.send('⚠ I\'m not connected in any channel. Try `' + client.config.BOT_PREFIX + 'join` to join the bot.'); }
            client.playermanager.setToPause(message.guild.id)
                .then(() => {
                    return message.channel.send('✅ The Stream is now paused !');
                })
                .catch((err) => {
                    if (err) { return message.channel.send('❌ Uh, an error has occured, I\'m sorry for the inconvenience. Try later.\n```JS\n' + err.message + '```'); }
                });
            break;
        case 'resume':
            if (!message.guild.me.voiceChannel) { return message.channel.send('⚠ I\'m not connected in any channel. Try `' + client.config.BOT_PREFIX + 'join` to join the bot.'); }
            client.playermanager.setToResume(message.guild.id)
                .then(() => {
                    return message.channel.send('✅ The Stream is now resumed !');
                })
                .catch((err) => {
                    if (err) { return message.channel.send('❌ Uh, an error has occured, I\'m sorry for the inconvenience. Try later.\n```JS\n' + err.message + '```'); }
                });
            break;
        case 'skip':
            if (!message.guild.me.voiceChannel) { return message.channel.send('⚠ I\'m not connected in any channel. Try `' + client.config.BOT_PREFIX + 'join` to join the bot.'); }
            if (queue.length === 0) { return message.channel.send('⚠ The queue is empty.'); }
            if (!message.guild.voiceConnection.player.dispatcher) { return message.channel.send('⚠ No stream detected.'); }
                message.channel.send('⏩ Skipping...')
                    .then((m) => {
                        m.delete();
                        try {
                            message.guild.voiceConnection.player.dispatcher.end();
                        } catch (exception) {
                            if (exception) { return message.channel.send('❌ Uh, an error has occured, I\'m sorry for the inconvenience. Try later.\n```JS\n' + exception.message + '```'); }
                        }
                    });
            break;
        case 'queue':
            if (!message.guild.me.voiceChannel) { return message.channel.send('⚠ I\'m not connected in any channel. Try `' + client.config.BOT_PREFIX + 'join` to join the bot.'); }
            if (queue.length === 0) { return message.channel.send('⚠ The queue is empty.'); }
            let text = queue.map((song, i) => (i > 0 && i < 15 ? '**' + i + '** - **<' + song.link + '>**' + ' - Added by **' + song.author + '**' : '')).join('\n');
            message.channel.send('Here\'s the queue of this server:\n\n' + (queue.length === 1 ? '**No music in queue !**' : text) + '\n\nNow Playing: **<' + queue[0].link + '>** - Added by **' + queue[0].author + '**')
                .catch((err) => {
                    if (err) { return message.channel.send('❌ Uh, an error has occured, I\'m sorry for the inconvenience. Try later.\n```JS\n' + err.message + '```'); }
                });
            break;
        case 'clear':
            if (!message.guild.me.voiceChannel) { return message.channel.send('⚠ I\'m not connected in any channel. Try `' + client.config.BOT_PREFIX + 'join` to join the bot.'); }
            if (queue.length === 0) { return message.channel.send('⚠ The queue is empty.'); }
            queue.splice(0, queue.length);
            message.channel.send('✅ The queue is delete.');
            break;
        case 'help':
            message.channel.send('Here\'s my all commands: `join`, `leave`, `play`, `pause`, `resume`, `skip`, `queue`, `clear`');
            break;
    }
});

client.on('error', console.error);

client.login(client.config.BOT_TOKEN);
