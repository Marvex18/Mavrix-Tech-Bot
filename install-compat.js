const { execSync, spawn } = require('child_process');
const fs = require('fs');
const chalk = require('chalk');

console.log(chalk.blue('🔧 Starting smart installation...'));

// Check Node.js version
const nodeVersion = process.version;
console.log(chalk.yellow(`📦 Node.js version: ${nodeVersion}`));

// Function to run command with fallback
function runCommand(command, fallbackCommand = null) {
    try {
        console.log(chalk.gray(`➡️  Running: ${command}`));
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.log(chalk.yellow(`⚠️  Command failed: ${command}`));
        if (fallbackCommand) {
            console.log(chalk.gray(`🔄 Trying fallback: ${fallbackCommand}`));
            try {
                execSync(fallbackCommand, { stdio: 'inherit' });
                return true;
            } catch (fallbackError) {
                console.log(chalk.red(`❌ Fallback also failed: ${fallbackCommand}`));
                return false;
            }
        }
        return false;
    }
}

// Try different installation methods
const methods = [
    'npm install --legacy-peer-deps --no-optional',
    'npm install --production --legacy-peer-deps',
    'npm install --force',
    'yarn install --ignore-engines',
    'pnpm install'
];

let success = false;
for (let method of methods) {
    console.log(chalk.cyan(`\n🔄 Trying installation method: ${method}`));
    success = runCommand(method);
    if (success) {
        console.log(chalk.green(`✅ Installation successful with: ${method}`));
        break;
    }
}

if (!success) {
    console.log(chalk.red('❌ All installation methods failed. Trying minimal installation...'));
    
    // Minimal core dependencies
    const coreDeps = [
        '@whiskeysockets/baileys',
        'axios',
        'chalk',
        'fs-extra',
        'pino',
        'qrcode-terminal',
        'ws'
    ];
    
    console.log(chalk.yellow('📦 Installing core dependencies only...'));
    coreDeps.forEach(dep => {
        try {
            execSync(`npm install ${dep} --no-save --legacy-peer-deps`, { stdio: 'inherit' });
        } catch (e) {
            console.log(chalk.red(`⚠️  Failed to install ${dep}`));
        }
    });
}

console.log(chalk.green('🎉 Installation process completed!'));
