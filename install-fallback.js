const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.yellow('🔄 Installing fallback dependencies...'));

// Alternative packages that provide similar functionality
const fallbackPackages = {
    'sharp': 'jimp', // Use jimp if sharp fails
    'fluent-ffmpeg': '', // Remove if not available
    'node-fetch': 'axios', // Use axios instead
    'cheerio': '', // Remove if not critical
};

Object.entries(fallbackPackages).forEach(([original, fallback]) => {
    if (fallback) {
        console.log(chalk.gray(`🔄 Using ${fallback} instead of ${original}`));
        try {
            execSync(`npm install ${fallback} --no-save`, { stdio: 'inherit' });
        } catch (error) {
            console.log(chalk.red(`⚠️  Failed to install fallback ${fallback}`));
        }
    }
});

console.log(chalk.green('✅ Fallback installation completed'));
