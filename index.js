const discord = require("discord.js");
const express = require('express');
const snekfetch = require("http");
const app = express();
const port = 3000;
let modmail = false;
let author_en = true
let waiting = false
app.get('/', (req, res) => res.send('Hello World!'));
let queue = []
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

const prefix = "sp: "

const client = new discord.Client();

client.on('ready', r => {

    console.log("Works.");
    console.log(r);
})
client.on('message', m => {
    if (m.author === client.user)return;
    const args = m.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const text = args.slice(1).join(' ')
    if (command === "help") {
        const embed = new discord.MessageEmbed()
            .setAuthor("Help Menu")
            .addField("Essentials", "sp: help\nsp: setup\nsp: submit\nsp: censors\nsp: prefix\nsp: announce <params>\nsp: version")
            .setImage(m.author.displayAvatarURL())
            .setFooter(m.createdAt)
            .setDescription('Commands.')
            .setColor("RANDOM")
        m.author.send(embed).then(r => {
            return r;
        })

    } else if (command === "submit") {
        try {
            if (waiting === false) {
                queue[0] = m.author.username
                const channel = m.guild.channels.cache.find(channel => channel.name === "submissions");
                const embed = new discord.MessageEmbed()
                    .setAuthor(m.author.username)
                    .setThumbnail(m.author.displayAvatarURL())
                    .setDescription("Submission")
                    .setColor('RANDOM')

                    .addField("Title", args[0])
                    .addField("Body", text)
                    .setTimestamp(m.createdAt)
                    .setFooter("Submission From " + m.author.username + " " + m.createdAt)

                channel.send(embed)
                waiting = true;
            }
            else {
                m.channel.send("Please wait until the next submission is approved. Discord API Doesn't grow on trees!")
            }
        }
        catch (E) {
            m.author.send("Cannot Execute Action find_channel() In type DMChannel.")
        }
    }
    else if (command === "tweet") {
        const user = args[0];
        const { body } = snekfetch.get(`https://nekobot.xyz/api/imagegen?type=${user.toLowerCase() === "realdonaldtrump" ? "trumptweet" : "tweet"}&username=${user.startsWith("@") ? user.slice(1) : user}&text=${encodeURIComponent(text)}`);
        m.channel.send("", { file: body.message });

    }
    else if (command === "author" && author_en === true) {
        m.channel.send("This Bot was made by Kai-Builder! https://www.github.com/Kai-Builder");
        m.channel.send("This bot" +
            "s ideas were made by UNKNOWN!")
        m.channel.send("@UNKNOWN, To Disable these credits, Type sp: disablecredits.");
    }
    else if (command === "disablecredits") {
        author_en = false
        m.channel.send("Disabled Credits! Now Users can not use the sp: author Command.")
    }
    else if (command === "enablecredits") {
        author_en = true
        m.channel.send("Enabled Credits! To Disable again, Type sp: disablecredits")
    }
    if (m.content === ";;app" && waiting === true) {
        waiting = false
        m.channel.send(queue[0] + "'s Sub Was approved")
        queue[0] = "\0"
    }
    else if (m.content === ";;deapp" && waiting === true) {
        waiting = false
        m.channel.send(queue[0] + "'s Sub Was Disapproved 😭")
        queue[0] = "\0"
    }
    if (m.guild  === null) {
        m.channel.send('DM Detected. For DM Help, Say sp: dm, For ModMail, Type sp:mods')
        modmail = true
    }
    if (command === "dm" && modmail === true) {

        m.channel.send("DM Commands\n- anon_send [msg] Anonymous reply")
    }
    if (command === "anon_send" && modmail === true) {
        let anonch = client.channels.cache.find(ch => ch.name === "modmail")
        anonch.send("Anonymous Message: " + text);
    }

})
client.login("TOEKN")