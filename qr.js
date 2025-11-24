const { exec } = require("child_process");
const { upload } = require('./mega');
const express = require('express');
const router = express.Router();
const pino = require("pino");
const { toBuffer } = require("qrcode");
const fs = require("fs-extra");
const path = require('path');
const { Boom } = require("@hapi/boom");

const MESSAGE = process.env.MESSAGE || `
「 SESSION ID CONNECTED 」
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
*https://github.com/ALI-INXIDE/ALI-MD*
`;

function randomMegaId(length = 6, numberLength = 4) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * characters.length));
    const number = Math.floor(Math.random() * Math.pow(10, numberLength));
    return `${result}${number}`;
}

const authDir = path.join(__dirname, 'auth_info_baileys');
if (fs.existsSync(authDir)) fs.emptyDirSync(authDir);

router.get('/', async (req, res) => {
    const { default: SuhailWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeInMemoryStore } = require("@whiskeysockets/baileys");
    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

    async function startSession() {
        const { state, saveCreds } = await useMultiFileAuthState(authDir);

        try {
            const sock = SuhailWASocket({
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
                auth: state
            });

            let qrSent = false;

            sock.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect, qr } = update;

                // QR code to frontend
                if (qr && !qrSent) {
                    qrSent = true;
                    try {
                        const qrBuffer = await toBuffer(qr);
                        res.setHeader('Content-Type', 'image/png');
                        res.end(qrBuffer);
                    } catch (err) {
                        console.error("QR error:", err);
                        if (!res.headersSent) res.status(500).send("QR generation error");
                    }
                }

                // Connection open
                if (connection === "open") {
                    await delay(3000);
                    const user = sock.user.id;

                    try {
                        const credsPath = path.join(authDir, 'creds.json');
                        if (!fs.existsSync(credsPath)) throw new Error("creds.json missing");

                        const megaUrl = await upload(fs.createReadStream(credsPath), `${randomMegaId()}.json`);
                        const string_session = megaUrl.replace('https://mega.nz/file/', '');
                        const sessionId = `ALI-MD~${string_session}`;

                        console.log(`\nSESSION-ID ==> ${sessionId}\n`);

                        const msg = await sock.sendMessage(user, { text: sessionId });
                        await sock.sendMessage(user, { text: MESSAGE }, { quoted: msg });

                        await fs.emptyDir(authDir); // Clear auth folder
                    } catch (err) {
                        console.error("Session upload error:", err);
                    }
                }

                // Connection closed
                if (connection === "close") {
                    const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    console.log("Connection closed, reason:", reason);

                    switch (reason) {
                        case DisconnectReason.connectionClosed:
                        case DisconnectReason.connectionLost:
                        case DisconnectReason.timedOut:
                            console.log("Connection lost, try again.");
                            break;
                        case DisconnectReason.restartRequired:
                            console.log("Restarting session...");
                            startSession().catch(console.error);
                            break;
                        default:
                            console.log("Unknown reason, restarting PM2...");
                            await delay(5000);
                            exec('pm2 restart qasim');
                            process.exit(0);
                    }
                }
            });

            sock.ev.on('creds.update', saveCreds);

        } catch (err) {
            console.error("Session start error:", err);
            await fs.emptyDir(authDir);
            exec('pm2 restart qasim');
        }
    }

    return startSession();
});

module.exports = router;