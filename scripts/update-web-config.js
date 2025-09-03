#!/usr/bin/env node

// Script to extract contract addresses from deployment logs and update web config
// Usage: node scripts/update-web-config.js

const fs = require('fs');
const path = require('path');

const DEPLOYMENTS_DIR = 'deployments';
const WEB_CONFIG_PATH = 'web/config.js';

// Network mapping from log files to config keys
const NETWORK_MAPPING = {
    'sepolia-deployment.log': 'sepolia',
    'base_sepolia-deployment.log': 'base_sepolia',
    'arbitrum_sepolia-deployment.log': 'arbitrum_sepolia',
    'optimism_sepolia-deployment.log': 'optimism_sepolia'
};

function extractAddressesFromLog(logContent) {
    const addresses = {};
    
    // Extract IdentityRegistry address
    const identityMatch = logContent.match(/IdentityRegistry deployed at: (0x[a-fA-F0-9]{40})/);
    if (identityMatch) {
        addresses.identityRegistry = identityMatch[1];
    }
    
    // Extract ReputationRegistry address
    const reputationMatch = logContent.match(/ReputationRegistry deployed at: (0x[a-fA-F0-9]{40})/);
    if (reputationMatch) {
        addresses.reputationRegistry = reputationMatch[1];
    }
    
    // Extract ValidationRegistry address
    const validationMatch = logContent.match(/ValidationRegistry deployed at: (0x[a-fA-F0-9]{40})/);
    if (validationMatch) {
        addresses.validationRegistry = validationMatch[1];
    }
    
    return addresses;
}

function updateWebConfig() {
    console.log('🔍 Extracting contract addresses from deployment logs...');
    
    if (!fs.existsSync(DEPLOYMENTS_DIR)) {
        console.error('❌ Deployments directory not found. Run deployments first.');
        process.exit(1);
    }
    
    const contractAddresses = {};
    
    // Process each deployment log
    Object.entries(NETWORK_MAPPING).forEach(([logFile, networkKey]) => {
        const logPath = path.join(DEPLOYMENTS_DIR, logFile);
        
        if (fs.existsSync(logPath)) {
            console.log(`📄 Processing ${logFile}...`);
            const logContent = fs.readFileSync(logPath, 'utf8');
            const addresses = extractAddressesFromLog(logContent);
            
            if (Object.keys(addresses).length > 0) {
                contractAddresses[networkKey] = addresses;
                console.log(`✅ Extracted addresses for ${networkKey}:`, addresses);
            } else {
                console.log(`⚠️  No addresses found in ${logFile}`);
            }
        } else {
            console.log(`⚠️  Log file not found: ${logFile}`);
        }
    });
    
    if (Object.keys(contractAddresses).length === 0) {
        console.log('❌ No contract addresses found in deployment logs');
        return;
    }
    
    // Generate new config content
    const configContent = `// ERC-8004 Contract Addresses Configuration
// Auto-generated from deployment logs on ${new Date().toISOString()}

const CONTRACT_ADDRESSES = ${JSON.stringify(contractAddresses, null, 4)};

// Auto-update contract addresses when config loads
if (typeof window !== 'undefined' && window.trustlessAgentsApp) {
    Object.entries(CONTRACT_ADDRESSES).forEach(([network, addresses]) => {
        window.trustlessAgentsApp.updateContractAddresses(network, addresses);
    });
}`;
    
    // Write updated config
    fs.writeFileSync(WEB_CONFIG_PATH, configContent);
    console.log(`✅ Updated ${WEB_CONFIG_PATH} with contract addresses`);
    
    // Generate deployment summary
    console.log('\n📋 Deployment Summary:');
    Object.entries(contractAddresses).forEach(([network, addresses]) => {
        console.log(`\n🌐 ${network.toUpperCase()}:`);
        console.log(`   Identity Registry:   ${addresses.identityRegistry || 'Not deployed'}`);
        console.log(`   Reputation Registry: ${addresses.reputationRegistry || 'Not deployed'}`);
        console.log(`   Validation Registry: ${addresses.validationRegistry || 'Not deployed'}`);
    });
    
    console.log('\n🎉 Web interface configuration updated successfully!');
    console.log('💡 You can now open web/index.html to test the interface');
}

// Run the script
updateWebConfig();
