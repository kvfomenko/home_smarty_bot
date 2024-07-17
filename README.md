
1) install Termux from https://f-droid.org/en/packages/com.termux/
2) install Hacker's Keyboard from Play Market
3) "apt update"
4) "apt upgrade"
5) "pkg install nodejs-lts"
6) call "passwd root" and create password "12345"
7) "pkg install openssh"
8) "sshd -d"  (for run ssh server on port 2022)
9) upload project files via ssh://root:12345@<phoneIP>:2022
10) use Ctrl+C for interrupt sshd
11) use termux-wake-lock (https://wiki.termux.com/wiki/Termux-wake-lock)
12) "apt install termux-api"
13) "npm install --save termux" https://www.npmjs.com/package/termux
14) "npm install node-telegram-bot-api"
15) call "node bot.js"
