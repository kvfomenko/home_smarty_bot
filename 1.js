/*
const battery = require("battery");
 
(async () => {
    const { level, charging } = await battery();
 
    console.log(level);
    //=> 0.8
 
    console.log(charging);
    //=> true
})();
*/

const api = require('termux')
 
if (!api.hasTermux) {
	console.log('termux module not found');
	process.exit(1)
}
 
api.vibrate()
	.duration(1000)
	.run()
 
api.batteryStatus()
	.run()
	.then(function (obj) {
		console.log(obj);
	})


