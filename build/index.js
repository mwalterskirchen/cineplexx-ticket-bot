"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const token = process.env.DISCORD_TOKEN;
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS] });
client.login(token);
function getText(linkText) {
    linkText = linkText.replace(/\r\n|\r/g, "\n");
    linkText = linkText.replace(/\ +/g, " ");
    // Replace &nbsp; with a space
    var nbspPattern = new RegExp(String.fromCharCode(160), "g");
    return linkText.replace(nbspPattern, " ");
}
const checkForTickets = async (channel) => {
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    await page.goto("https://www.cineplexx.at/service/movieStartTimes.php?movie=174529&stateId=AT-9");
    const spans = await page.$$("span");
    for (let i = 0; i < spans.length; i++) {
        const valueHandle = await spans[i].getProperty("innerText");
        const spanText = await valueHandle.jsonValue();
        const text = getText(spanText).toLowerCase();
        if (text.includes("apollo")) {
            channel.send(`Tickets are available in ${text} 🎥`);
        }
    }
    await browser.close();
};
client.once("ready", () => {
    console.log("Ready!");
    const channel = client.channels.cache.get("920232168159072259");
    checkForTickets(channel);
    setInterval(() => checkForTickets(channel), 300000);
});
