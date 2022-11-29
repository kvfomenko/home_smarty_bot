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
                //await bot.sendMessage(msg.chat.id, 'Для авторизации сообщите нам свой номер телефона', send_contact_option);

            //} else if (/^\/help/.test(msg.text)) {
            //    await bot.sendMessage(msg.chat.id, conf.help_answer);

            } else {
                //console.log('unknown command from ' + msg.from.first_name + ': ' + msg.text);
            }
        }

    });

    bot.on('contact', async (msg) => {
        if (msg.contact.user_id === msg.from.id) {
            console.log('current user contact received ' + msg.contact.first_name + ' ' + msg.contact.phone_number);
            await add_subscriber(msg);
            await bot.sendMessage(msg.chat.id, `${msg.contact.first_name}, Вы успешно авторизовались. Теперь вы можете отправить мне свои пожелания (+автомобиль/-автомобиль) или узнать пожелания ваших контактов, для этого просто отправьте мне любой контакт`);
        } else {
            console.log('VCARD contact received ' + msg.contact.phone_number);
            let card = vCard.parse(msg.contact.vcard);
            for (let i=0; i<card.tel.length; i++) {
                if (card.tel[i].value.substring(0,1) === '+') {
                    card.tel[i].value = card.tel[i].value.substring(1);
                }
                console.log('VCARD tel ' + (i+1) + ': ' + card.tel[i].value);
                if (app_state.state.wishes[card.tel[i].value] &&
                    app_state.state.wishes[card.tel[i].value].length > 0) {
                    let wishes = '';
                    console.log('WISHES COUNT ' + app_state.state.wishes[card.tel[i].value].length);

                    for (let j=0; j < app_state.state.wishes[card.tel[i].value].length; j++) {
                        wishes = wishes + (j+1) + ' ' + app_state.state.wishes[card.tel[i].value][j] + '\n';
                        //console.log('iii ' + j);
                    }
                    await bot.sendMessage(msg.chat.id, 'Пожелания по номеру ' + card.tel[i].value + ':\n' + wishes);
                } else {
                    await bot.sendMessage(msg.chat.id, 'Пожелания по номеру ' + card.tel[i].value + ' отсутствуют');
                }
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
var prev = {level:null, status:null, init:false};

async function refresh_battery_state() {
    if (!global_error) {
        termuxapi.batteryStatus()
            .run()
            .then(function (obj) {
                let bat = obj;
                //console.log('refresh_battery_state ', bat.status, bat.percentage)

                if (prev.status !== bat.status) {
                    if (prev.init) {
                        if (bat.status === 'CHARGING') {
                            sendMessageToAll('Питание ДТЭК восстановлено')
                            console.log('Питание ДТЭК восстановлено')
                        } else {
                            sendMessageToAll('Питание ДТЭК отключено')
                            console.log('Питание ДТЭК отключено')
                        }
                    }
                    prev = {status: bat.status, level: bat.percentage, init: true};
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


