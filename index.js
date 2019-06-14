const Discord = require('discord.js');
const client = new Discord.Client();
const fetch = require('isomorphic-unfetch');
const TOKEN = process.env.AWS_GIBOT_TOKEN;
const YT_API_KEY = process.env.AWS_GIBOT_YT_API_TOKEN;
var google = require('googleapis');
const ytdl = require('ytdl-core-discord');
const youtubeV3 = new google.youtube_v3.Youtube({ version: 'v3', auth: YT_API_KEY });
const YT_BASE_URL = 'https://www.youtube.com/watch?v=';

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

async function play(connection, url) {
  return connection.playOpusStream(await ytdl(url));
}
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

const handleSong = async (song, connection, message) => {
  console.log(song);
  const { title, thumbnails } = song.snippet;
  play(connection, YT_BASE_URL + song.id.videoId);
  console.log(thumbnails.default)
  const imageMessage = {
    embed: {
      color: '24311',
      description: title,
      image: {
        url: thumbnails.medium.url
      }
    }
  };
  await message.reply(imageMessage);
};

client.on('message', async message => {
  // Only try to join the sender's voice channel if they are in one themselves

  const content = message.content;
  if (content === '!g stop') {
    console.log('Stopping ...');
    isPlaying = false;
    message.member.voiceChannel.leave();
    return;
  }



  let term = '';
  let songMetadata = {};
  let isSong = false;
  if (content.indexOf('!g') === 0) {
    term = content.split('!g ')[1];
    console.log('new search for:', term);
    if (term.indexOf('song ') === 0) {
      isSong = true;
      entity = 'song';
      term = content.split('!g song ')[1];
      console.log('Song search!')
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
    let song;
    
    var request = youtubeV3.search.list(
      {
        part: 'snippet',
        type: 'video',
        q: term,
        videoCategoryId: 10,
        maxResults: 50,
        order: 'relevance',
        safeSearch: 'moderate',
        videoEmbeddable: true
      },
      (err, response) => {
        if (response && !isSong) handleSong(randomizeResult(response.data.items, 25), connection, message);
        if (response && isSong) handleSong(response.data.items[0], connection, message);
      }
    );

    // const playingOptions = {
    //   volume: 0.14
    // };
    // const dispatcher = connection.playStream(
    //   songMetadata.previewUrl,
    //   playingOptions
    // );
    const log = `${songMetadata.trackName} - ${songMetadata.artistName}`;
    console.log('now playing:', log);

    isPlaying = true;

    // dispatcher.on('end', () => {
    //   message.member.voiceChannel.leave();
    //   isPlaying = false;
    // });
  } else {
    console.log('User not joind a voice channel... canceled');
    return message.reply('You need to join a voice channel first!');
  }
});
