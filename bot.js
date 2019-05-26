const Discord = require('discord.js');
const client = new Discord.Client();
var path = require('path');
console.log('index file loaded')
const TOKEN = 'NTgxMTgyOTYzNDU1MzYxMDQ1.XOeLuQ.o_jy4GGxO5NB1DOFZoKIAUhAQlg';
client.login(TOKEN);

client.on('ready', ()=> {
  console.log('Bot is up and running ... yay');
  
})

client.on('message', message => {
  // Voice only works in guilds, if the message does not come from a guild,

  // Only try to join the sender's voice channel if they are in one themselves
  if (message.member.voiceChannel) {
    message.member.voiceChannel
      .join()
      .then(connection => {
        try {
          const dispatcher = connection.playFile('song.mp3');
          console.log('playing song : song.mp3')
          dispatcher.on('end', ()=> {
            message.member.voiceChannel.leave()
          }) 
        } catch(e) {
          console.log(e)  
        }
      })
      .catch(console.log);
  } else {
    message.reply('You need to join a voice channel first!');
  }
});
