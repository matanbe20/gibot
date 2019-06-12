const Discord = require('discord.js');
const client = new Discord.Client();
const fetch = require('isomorphic-unfetch');
const TOKEN = 'NTgxMTgyOTYzNDU1MzYxMDQ1.XOeLuQ.o_jy4GGxO5NB1DOFZoKIAUhAQlg';

client.login(TOKEN);

client.on('ready', () => {
  console.log('Bot is up and running ... yay');
  client.user
    .setActivity('!g <Artist Name>', { type: 'LISTENING' })
    .then(presence =>
      console.log(
        `Activity set to ${presence.game ? presence.game.name : 'none'}`
      )
    );
});
let isPlaying = false;

const randomizeResult = (array, randomizerValue) => {
  console.log('found ', array.length, ' results');
  let numberRandom;
  if (array.length > randomizerValue) numberRandom = randomizerValue;
  else numberRandom = array.length;
  const randomNum = Math.floor(Math.random() * numberRandom) + 0;
  return array[randomNum];
};

let entity = 'musicArtist';

client.on('message', async message => {
  // Only try to join the sender's voice channel if they are in one themselves

  const content = message.content;
  if (content === '!g stop') {
    console.log('Stopping ...');
    isPlaying = false;
    message.member.voiceChannel.leave();
    return;
  }

  if (isPlaying) return;

  let term = '';
  let songMetadata = {};
  let isSong = false;
  if (content === ';roast Gibor')  await message.reply('ברק הזה אפס... יואו');
  if (content.indexOf('!g') === 0) {
    term = content.split('!g ')[1];
    console.log('new search for:', term);
    if (term === 'song') {
      isSong = true;
      entity = 'song';
      term = content.split('!g song ')[1];
    }
    term = term.replace(' ', '+');
  } else return;

  if (message.member.voiceChannel) {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${term}&media=music`
    );
    console.log('fetching list ... ');
    const data = await response.json();
    if (!data || !data.results.length)
      return message.reply('No song was found :(');
    songMetadata = isSong
      ? randomizeResult(data.results, 2)
      : randomizeResult(data.results, 35);

    const channel = message.member.voiceChannel;
    const connection = await channel.join();
    const playingOptions = {
      volume: 0.14
    };
    const dispatcher = connection.playStream(
      songMetadata.previewUrl,
      playingOptions
    );
    const log = `${songMetadata.trackName} - ${songMetadata.artistName}`;
    console.log('now playing:', log);
    const imageMessage = {
      embed: {
        color: '24311',
        description: log,
        image: {
          url: songMetadata.artworkUrl100
        }
      }
    };
    await message.reply(imageMessage);
    isPlaying = true;

    dispatcher.on('end', () => {
      message.member.voiceChannel.leave();
      isPlaying = false;
    });
  } else {
    console.log('User not joind a voice channel... canceled');
    return message.reply('You need to join a voice channel first!');
  }
});
