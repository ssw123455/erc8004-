#!/usr/bin/env node

/**
 * Updates web/config.js with deployed contract addresses
 * Usage: node scripts/update-web-config.js <network> <identityRegistry> <reputationRegistry> <validationRegistry>
 */

const fs = require('fs');
const path = require('path');

function updateWebConfig(network, identityRegistry, reputationRegistry, validationRegistry) {
    const configPath = path.join(__dirname, '../web/config.js');
    
    if (!fs.existsSync(configPath)) {
        console.error('❌ web/config.js not found');
        process.exit(1);
    }
    
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Create the replacement pattern for the specific network
    const networkPattern = new RegExp(
        `(${network}:\\s*{[^}]*identityRegistry:\\s*")[^"]*(",[^}]*reputationRegistry:\\s*")[^"]*(",[^}]*validationRegistry:\\s*")[^"]*("[^}]*})`,
        'g'
    );
    
    const replacement = `$1${identityRegistry}$2${reputationRegistry}$3${validationRegistry}$4`;
    
    if (networkPattern.test(configContent)) {
        configContent = configContent.replace(networkPattern, replacement);
        fs.writeFileSync(configPath, configContent);
        console.log(`✅ Updated web/config.js with ${network} contract addresses`);
        console.log(`   Identity Registry: ${identityRegistry}`);
        console.log(`   Reputation Registry: ${reputationRegistry}`);
        console.log(`   Validation Registry: ${validationRegistry}`);
    } else {
        console.error(`❌ Could not find ${network} section in config.js`);
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 4) {
    console.error('Usage: node update-web-config.js <network> <identityRegistry> <reputationRegistry> <validationRegistry>');
    process.exit(1);
}

const [network, identityRegistry, reputationRegistry, validationRegistry] = args;
updateWebConfig(network, identityRegistry, reputationRegistry, validationRegistry);