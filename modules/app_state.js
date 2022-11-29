"use strict";
const fs = require('fs'),
    util = require('./util');

const conf = util.includeConfig('../app_conf.json');

var state = {
    prev_time: null,
    cache_data: {},
    subscribers: {}
};

async function save() {
    //console.log('in app_state.save');
    try {
        let raw_data = JSON.stringify(state, null, 2);
        //console.log('state: ' + raw_data);
        await fs.writeFileSync(conf.app_state_file_path, raw_data);
    } catch (err) {
        console.warn(err);
    }
}
async function load() {
    //console.log('in app_state.load');
    try {
        let raw_data = await fs.readFileSync(conf.app_state_file_path);
        //console.log('state: ' + raw_data);
        state = JSON.parse(raw_data);
    } catch (err) {
        console.warn(conf.app_state_file_path + ' is empty');
        await save();
    }
}

async function init() {
    await load();
    module.exports.state = state;
    module.exports.save = save;
    module.exports.load = load;
}

module.exports.init = init;

