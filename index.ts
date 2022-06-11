import puppeteer from "puppeteer";
import { Client, Intents } from "discord.js";
import { config } from "dotenv";

config();

const token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.login(token);

function getText(linkText: string) {
  linkText = linkText.replace(/\r\n|\r/g, "\n");
  linkText = linkText.replace(/\ +/g, " ");

  // Replace &nbsp; with a space
  var nbspPattern = new RegExp(String.fromCharCode(160), "g");
  return linkText.replace(nbspPattern, " ");
}

const checkForTickets = async (channel: any) => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/usr/bin/chromium-browser",
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-sandbox",
    ],
  });
  const page = await browser.newPage();
  await page.goto(
    `https://www.cineplexx.at/service/movieStartTimes.php?movie=${process.env.MOVIE_ID}&stateId=${process.env.STATE}`
  );

  const spans = await page.$$("span");

  for (let i = 0; i < spans.length; i++) {
    const valueHandle = await spans[i].getProperty("innerText");
    const spanText: string = await valueHandle.jsonValue();
    const text = getText(spanText).toLowerCase();
    if (text.includes("apollo")) {
      channel.send(`Tickets are available in ${text} 🎥`);
    }
  }

  await browser.close();
};

client.once("ready", () => {
  console.log("Ready!");
  const channel: any = client.channels.cache.get(
    process.env.DISCORD_CHANNEL_ID
  );
  checkForTickets(channel);
  setInterval(() => checkForTickets(channel), 600000);
});
