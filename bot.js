const Discord = require('discord.js');
const client = new Discord.Client();
var path = require('path');

const TOKEN = 'NTgxMTgyOTYzNDU1MzYxMDQ1.XOeLuQ.o_jy4GGxO5NB1DOFZoKIAUhAQlg';
client.login(TOKEN);

client.on('message', message => {
  // Voice only works in guilds, if the message does not come from a guild,

  // Only try to join the sender's voice channel if they are in one themselves
  if (message.member.voiceChannel) {
    message.member.voiceChannel
      .join()
      .then(connection => {
        const dispatcher = connection.playFile(path.join(__dirname, 'audio', 'song.mp3'));
        dispatcher.on('end', ()=> {
          message.member.voiceChannel.leave()
        })
      })
      .catch(console.log);
  } else {
    message.reply('You need to join a voice channel first!');
  }
});
