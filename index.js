const axios = require('axios');
const cheerio = require('cheerio');

// Telegram notification
async function sendTelegramMessage(botToken, chatId, message) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: chatId,
            text: message,
        });
        console.log('🚀 Telegram notification sent!');
    } catch (error) {
        console.error('❌ Failed to send Telegram message:', error.response ? error.response.data : error.message);
    }
}

async function run(searchString) {
    try {
        const response = await axios.get('https://www.simonwahl.com/konzerte/');
        const html = response.data;
        const $ = cheerio.load(html);

        const contentArea = $('#content_area');
        if (!contentArea.length) {
            console.log('❌ content_area not found');
            return false;
        }

        let found = false;

        contentArea.find('strong').map((i, elem) => {

            const text = $(elem).text().toLowerCase();
            if (text.includes(searchString.toLowerCase())) {
                found = true;
            }
        });

        if (found) {
            console.log(`✅ Found the word "${searchString}" inside <strong> tags.`);
        } else {
            console.log(`❌ No match for "${searchString}".`);
        }

        return found;
    } catch (error) {
        console.error('❌ Error fetching the page:', error.message);
        return false;
    }
}

async function main() {
    const searchString = 'berlin';
    // TODO: get variables from envs
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHAT_ID,
        `Application restarted`
    );

    for (let i = 0; i < 5; i++) {
        console.log(`Run #${i + 1}`);
        const found = await run(searchString);

        if (found) {
            console.log('🎯 Word found! Sending Telegram notification.');
            await sendTelegramMessage(
                TELEGRAM_BOT_TOKEN,
                TELEGRAM_CHAT_ID,
                `✅ The word "${searchString}" was found on the concerts page! 🎶`
            );
            return; // Stop after found
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
    }

    console.log('Finished 5 tries without finding the word.');
}

main();
