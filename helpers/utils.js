module.exports.getCurrentQueue = (queues, guildID) => {
        if (!queues[guildID]) { queues[guildID] = []; }
        return queues[guildID];
};

module.exports.play = (client, message, song) => {
    client.playermanager.playYouTube(message.guild.me.voiceChannel.id, song)
        .then((stream) => {
            message.channel.send('✅ I play now **<' + song + '>** !');
            stream.on('error', (error) => {
                if (error) { message.channel.send('❌ Uh, an error has occured, I\'m sorry for the inconvenience. Try later.\n```JS\n' + error.message + '```'); }
            });
            stream.on('end', () => {
                if (this.getCurrentQueue(client.config.BOT_QUEUES, message.guild.id).length === 0) { return message.channel.send('The queue is over. 👌'); }
                else {
                    this.getCurrentQueue(client.config.BOT_QUEUES, message.guild.id).shift();
                    this.play(client, message, this.getCurrentQueue(client.config.BOT_QUEUES, message.guild.id)[0].link);
                }
            });
        })
        .catch((err) => {
            if (err) { return message.channel.send('❌ Uh, an error has occured, I\'m sorry for the inconvenience. Try later.\n```JS\n' + err.message + '```'); }
        });
};
