"use strict";

function addLeadingZero(val, digits) {
    let k;
    for (k=digits; k>1; k--) {
        if (digits >= k && val < Math.pow(10, digits-1)) { val = "0" + val; }
    }
    return val;
}

function getFormattedTime() {
    let today = new Date();
    let h = addLeadingZero(today.getHours(), 2);
    let m = addLeadingZero(today.getMinutes(), 2);
    let s = addLeadingZero(today.getSeconds(), 2);
    return h + ":" + m + ":" + s;
}

function getFormattedDateTime() {
    let today = new Date();
    let y = today.getFullYear();
    let mn = ("0" + (today.getMonth() + 1)).slice(-2);
    let d = ("0" + today.getDate()).slice(-2);
    let h = addLeadingZero(today.getHours(), 2);
    let m = addLeadingZero(today.getMinutes(), 2);
    let s = addLeadingZero(today.getSeconds(), 2);
    return y + '-' + mn + '-' + d + ' ' + h + ":" + m + ":" + s;
}

function log(val) {
    console.log(getFormattedTime() + ' ' + val);
}

module.exports.getFormattedTime = getFormattedTime;
module.exports.getFormattedDateTime = getFormattedDateTime;
module.exports.log = log;

exports.includeConfig = function(pathToConfig) {
    console.log('in util.includeConfig ' + __dirname + '/' + pathToConfig);
    try {
        var conf = require(pathToConfig);
    } catch (ex) {
        conf = {};
        console.warn('NOTICE: ' + __dirname + '/' + pathToConfig + ' not found at ' + JSON.stringify(ex));
    }
    let pathToLocalConfig = pathToConfig.replace('.json', '_local.json');
    try {
        let conf_local = require(pathToLocalConfig);
        conf = Object.assign(conf, conf_local);
    } catch (ex) {
        console.warn('NOTICE: '+pathToLocalConfig+' not found at ' + JSON.stringify(ex));
    }
    return conf;
}

