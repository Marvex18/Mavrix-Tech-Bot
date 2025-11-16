const fs = require('fs');
const chalk = require('chalk');

console.log(chalk.blue('🔍 Checking installation integrity...'));

const requiredModules = [
    '@whiskeysockets/baileys',
    'axios',
    'chalk',
    'fs-extra',
    'pino',
    'qrcode-terminal'
];

let allGood = true;

requiredModules.forEach(module => {
    try {
        require.resolve(module);
        console.log(chalk.green(`✅ ${module} - OK`));
    } catch (error) {
        console.log(chalk.red(`❌ ${module} - MISSING`));
        allGood = false;
    }
});

if (allGood) {
    console.log(chalk.green('\n🎉 All core dependencies installed successfully!'));
} else {
    console.log(chalk.yellow('\n⚠️  Some dependencies are missing. Bot may run with limited functionality.'));
    
    // Create a fallback index that can work with minimal dependencies
    const fallbackCode = `
    console.log('🚀 Starting Mavrix Bot with minimal dependencies...');
    // Minimal bot code can go here
    `;
    
    fs.writeFileSync('fallback-index.js', fallbackCode);
    console.log(chalk.blue('📁 Created fallback-index.js for minimal operation'));
}

console.log(chalk.cyan('💡 Tip: Run "npm run install:minimal" for a minimal working setup'));
