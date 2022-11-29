const TelegramBot = require('node-telegram-bot-api');
const termuxapi = require('termux');
const util = require('./modules/util');

let app_state = require('./modules/app_state');


const conf = util.includeConfig('../app_conf.json');

let bot;


async function add_subscriber(msg) {
    console.log('in add_subscriber: ' + JSON.stringify(msg));

    if (!app_state.state.subscribers[msg.chat.id]) {
        app_state.state.subscribers[msg.chat.id] = {subscribe_time: util.getFormattedDateTime()};
    }
    await app_state.save();
}



async function start_bot() {
    bot = new TelegramBot(conf.bot.token, {polling: conf.bot.polling});
    console.log('bot ' + conf.bot.name + ' started...');
    let rows;

    bot.on('message', async (msg) => {
        console.log('msg ' + JSON.stringify(msg));
        if (msg.chat.type === 'private' || (msg.text && msg.text.indexOf('@'+conf.bot.name) >= 0)) {
            //console.log('on message(' + msg.text + ') ' + JSON.stringify(msg));

            if (/\/start/.test(msg.text)) {
                console.log('start ' + msg.chat.id + ' ' + msg.from.first_name);
                await add_subscriber(msg);

            } else if (/^\/status/.test(msg.text)) {
                await bot.sendMessage(msg.chat.id, prev_state);

            } else {
                //console.log('unknown command from ' + msg.from.first_name + ': ' + msg.text);
            }
        }

    });
}

async function sendMessageToAll(text) {
    //await bot.sendMessage('313404677', text);

    for (let chat_id in app_state.state.subscribers) {
        await bot.sendMessage(chat_id, text);
    }
}

var global_error = false;
var prev = {level:0, status:false, init:false};
var prev_state;

async function refresh_battery_state() {
    if (!global_error) {
        termuxapi.batteryStatus()
            .run()
            .then(function (obj) {
                let bat = obj;
                prev_state = bat;
                //console.log('refresh_battery_state ', bat.status, bat.percentage);

                if (prev.status !== bat.status) {
                    if (prev.init) {
                        if (bat.status === 'CHARGING' || bat.status === 'FULL') {
                            sendMessageToAll('Питание ДТЭК восстановлено')
                            console.log('Питание ДТЭК восстановлено')
                        } else {
                            sendMessageToAll('Питание ДТЭК отключено')
                            console.log('Питание ДТЭК отключено')
                        }
                    }
                    prev = {status: bat.status, init: true};
                }
                if (prev.level !== bat.percentage) {
                    console.log('Level:' + bat.percentage);
                    prev.level = bat.percentage;
                }
            })
            .catch(function (e) {
                global_error = true;
                console.log('error:', e);
                process.exit(1);
            });
    }
}

async function start_battery_monitor(){
    setInterval(refresh_battery_state, conf.refresh_battery_state_interval);
}

async function init() {
    if (!termuxapi.hasTermux) {
        console.log('termux module not found');
        process.exit(1);
    }

    await app_state.init();

    await start_bot();
    await start_battery_monitor();
}

init();


