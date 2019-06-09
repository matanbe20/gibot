const Discord = require("discord.js");
const client = new Discord.Client();
const fetch = require("isomorphic-unfetch");
const TOKEN = "NTgxMTgyOTYzNDU1MzYxMDQ1.XOeLuQ.o_jy4GGxO5NB1DOFZoKIAUhAQlg";

client.login(TOKEN);

client.on("ready", () => {
  console.log("Bot is up and running ... yay");
});

let isPlaying = false;

const randomizeResult = array => {
  let numberRandom;
  if (array.length > 12) numberRandom = 12;
  else numberRandom = array.length;
  const randomNum = Math.floor(Math.random() * numberRandom) + 0;
  return array[randomNum];
};

client.on("message", async message => {
  // Only try to join the sender's voice channel if they are in one themselves
  if (isPlaying) return;
  const content = message.content;
  let term = "";
  let songMetadata = {};

  if (content.indexOf("!g") === 0) {
    term = content.split("!g ")[1];
    term = term.replace(" ", "+");
    console.log(`https://itunes.apple.com/search?term=${term}`);
  } else return;

  if (message.member.voiceChannel) {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${term}`
    );
    const data = await response.json();
    console.log(data);
    try {
      if (!data || !data.results.length)
        return message.reply("No song was found :(");
      songMetadata = randomizeResult(data.results);
    } catch (e) {
      console.log(e);
    }

    const channel = message.member.voiceChannel;
    const connection = await channel.join();
    const dispatcher = connection.playStream(songMetadata.previewUrl);
    await message.reply(
      `Playing: "${songMetadata.trackName}"  By: ${songMetadata.artistName}`
    );
    message.channel.send(songMetadata.artworkUrl100);

    dispatcher.on("end", () => {
      message.member.voiceChannel.leave();
      isPlaying = false;
    });
  } else {
    return message.reply("You need to join a voice channel first!");
  }
});