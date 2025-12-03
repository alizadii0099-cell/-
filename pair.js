const express = require('express');
const fs = require('fs-extra');
const { exec } = require("child_process");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const { upload } = require('./mega');

let router = express.Router();

const MESSAGE = `「 SESSION ID CONNECTED 」
*╭──────────────────⳹*
*│✅ ʏᴏᴜʀ sᴇssɪᴏɴ ɪᴅ ɪs ʀᴇᴀᴅʏ!*
*│⚠️ ᴋᴇᴇᴘ ɪᴛ ᴘʀɪᴠᴀᴛᴇ ᴀɴᴅ sᴇᴄᴜʀᴇ*
*│🔐 ᴅᴏɴ'ᴛ sʜᴀʀᴇ ɪᴛ ᴡɪᴛʜ ᴀɴʏᴏɴᴇ*
*│✨ ᴇxᴘʟᴏʀᴇ ᴛʜᴇ ᴄᴏᴏʟ ғᴇᴀᴛᴜʀᴇs*
*│🤖 ᴇɴᴊᴏʏ sᴇᴀᴍʟᴇs ᴀᴜᴛᴏᴍᴀᴛɪᴏɴ*
*╰──────────────────⳹*
🪀 *ᴏғғɪᴄɪᴀʟ ᴄʜᴀɴɴᴇʟ:*  
*https://whatsapp.com/channel/0029VaoRxGmJpe8lgCqT1T2h*

🖇️ *ɢɪᴛʜᴜʙ ʀᴇᴘᴏ:*  
*https://github.com/ALI-INXIDE/ALI-MD*`;

async function loadBaileys() {
    return await import('@whiskeysockets/baileys');
}

if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.send({ error: 'Please provide ?number=your_whatsapp_number' });

    const {
        default: makeWASocket,
        useMultiFileAuthState,
        delay,
        makeCacheableSignalKeyStore,
        Browsers,
        DisconnectReason
    } = await loadBaileys();

    async function SUHAIL() {
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

        try {
            const Smd = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!Smd.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Smd.requestPairingCode(num);
                if (!res.headersSent) res.send({ code });
            }

            Smd.ev.on('creds.update', saveCreds);

            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    try {
                        await delay(3000);

                        if (fs.existsSync('./auth_info_baileys/creds.json')) {
                            
                            const auth_path = './auth_info_baileys/';

                            function randomMegaId(length = 6, numberLength = 4) {
                                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                                let result = '';
                                for (let i = 0; i < length; i++) {
                                    result += chars.charAt(Math.floor(Math.random() * chars.length));
                                }
                                const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                                return `${result}${number}`;
                            }

                            // Upload creds
                            const mega_url = await upload(
                                fs.createReadStream(auth_path + 'creds.json'),
                                `${randomMegaId()}.json`
                            );

                            let rawId = mega_url.split('/file/')[1] || mega_url;
                            let sessionId = `ALI-MD~${rawId}`;
                            const userJid = `${num}@s.whatsapp.net`;

                            // Gift card for quoted msg
                            const gift = {
                                key: {
                                    fromMe: false,
                                    participant: "0@s.whatsapp.net",
                                    remoteJid: "status@broadcast"
                                },
                                message: {
                                    contactMessage: {
                                        displayName: `SESSION ID ☁️`,
                                        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:'ALI-MD'\nitem1.TEL;waid=${num}:${num}\nEND:VCARD`
                                    }
                                }
                            };

                            // ⭐ FIRST MESSAGE → Session + Buttons
                            await Smd.sendMessage(userJid, {
                                text: sessionId,
                                buttons: [
                                    {
                                        name: "cta_copy",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "Copy Session",
                                            copy_code: sessionId
                                        })
                                    },
                                    {
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "Bot Repo",
                                            url: "https://github.com/ALI-INXIDE/ALI-MD"
                                        })
                                    },
                                    {
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "Join Channel",
                                            url: "https://whatsapp.com/channel/0029VaoRxGmJpe8lgCqT1T2h"
                                        })
                                    }
                                ]
                            });

                            // ⭐ SECOND MESSAGE → Text (quoted with gift)
                            await Smd.sendMessage(
                                userJid,
                                { text: MESSAGE },
                                { quoted: gift }
                            );

                            await delay(1000);
                            fs.emptyDirSync(__dirname + '/auth_info_baileys');
                        }

                    } catch (e) {
                        console.log("Upload/Send Error: ", e);
                    }

                    await delay(100);
                    fs.emptyDirSync(__dirname + '/auth_info_baileys');
                }

                // Handle connection close
                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    if (reason === DisconnectReason.restartRequired) {
                        SUHAIL().catch(err => console.log(err));
                    } else {
                        exec('pm2 restart qasim');
                    }
                }
            });

        } catch (err) {
            console.log("Error in SUHAIL: ", err);
            exec('pm2 restart qasim');
            fs.emptyDirSync(__dirname + '/auth_info_baileys');
            if (!res.headersSent) res.send({ code: "Try After Few Minutes" });
        }
    }

    await SUHAIL();
});

module.exports = router;
