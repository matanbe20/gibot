const Discord = require("discord.js");
const client = new Discord.Client();
const fetch = require("isomorphic-unfetch");
const TOKEN = "NTgxMTgyOTYzNDU1MzYxMDQ1.XOeLuQ.o_jy4GGxO5NB1DOFZoKIAUhAQlg";

client.login(TOKEN);

client.on("ready", () => {
  console.log("Bot is up and running ... yay");
});

let isPlaying = false;

const randomizeResult = (array, randomizerValue) => {
  let numberRandom;
  if (array.length > randomizerValue) numberRandom = randomizerValue;
  else numberRandom = array.length;
  const randomNum = Math.floor(Math.random() * numberRandom) + 0;
  return array[randomNum];
};

let entity = "musicArtist";

client.on("message", async message => {
  // Only try to join the sender's voice channel if they are in one themselves
  if (isPlaying) return;
  const content = message.content;
  let term = "";
  let songMetadata = {};
  let isSong = false;
  if (content.indexOf("!g") === 0) {
    term = content.split("!g ")[1];
    if (term === "song") {
      isSong = true;
      entity = "song";
      term = content.split("!g song ")[1];
    }
    term = term.replace(" ", "+");
  } else return;

  if (message.member.voiceChannel) {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${term}&media=music`
    );
    const data = await response.json();
    if (!data || !data.results.length)
      return message.reply("No song was found :(");
    songMetadata = isSong
      ? randomizeResult(data.results, 2)
      : randomizeResult(data.results, 15);

    const channel = message.member.voiceChannel;
    const connection = await channel.join();
    const dispatcher = connection.playStream(songMetadata.previewUrl);
    const log = `Playing: "${songMetadata.trackName}"  By ${
      songMetadata.artistName
    }`;
    console.log(log);
    await message.reply(log);
    isPlaying = true;
    message.channel.send(songMetadata.artworkUrl100);

    dispatcher.on("end", () => {
      message.member.voiceChannel.leave();
      isPlaying = false;
    });
  } else {
    return message.reply("You need to join a voice channel first!");
  }
});
