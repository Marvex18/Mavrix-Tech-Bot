// postinstall-check.js - No chalk version
const fs = require('fs');

// Simple color system
const colors = {
    reset: '\x1b[0m',
    blue: '\x1b[34m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

const color = {
    blue: (text) => `${colors.blue}${text}${colors.reset}`,
    green: (text) => `${colors.green}${text}${colors.reset}`,
    red: (text) => `${colors.red}${text}${colors.reset}`,
    yellow: (text) => `${colors.yellow}${text}${colors.reset}`,
    cyan: (text) => `${colors.cyan}${text}${colors.reset}`
};

console.log(color.blue('🔍 Checking installation integrity...'));

const requiredModules = [
    '@whiskeysockets/baileys',
    'axios',
    'fs-extra',
    'pino',
    'qrcode-terminal'
];

let allGood = true;

requiredModules.forEach(module => {
    try {
        require.resolve(module);
        console.log(color.green(`✅ ${module} - OK`));
    } catch (error) {
        console.log(color.red(`❌ ${module} - MISSING`));
        allGood = false;
    }
});

if (allGood) {
    console.log(color.green('\n🎉 All core dependencies installed successfully!'));
} else {
    console.log(color.yellow('\n⚠️  Some dependencies are missing.'));
}

console.log(color.cyan('💡 Bot ready to start!'));
