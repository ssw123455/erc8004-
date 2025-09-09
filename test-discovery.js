// Test script to debug agent discovery
const { ethers } = require('ethers');

async function testDiscovery() {
    console.log('🔍 Testing agent discovery...');
    
    // Contract addresses
    const contracts = {
        sepolia: "0x127C86a24F46033E77C347258354ee4C739b139C",
        base_sepolia: "0x19fad4adD9f8C4A129A078464B22E1506275FbDd",
        optimism_sepolia: "0x19fad4adD9f8C4A129A078464B22E1506275FbDd"
    };
    
    // RPC URLs
    const rpcs = {
        sepolia: "https://ethereum-sepolia-rpc.publicnode.com",
        base_sepolia: "https://sepolia.base.org",
        optimism_sepolia: "https://sepolia.optimism.io"
    };
    
    // Contract ABI
    const abi = [
        "function getAgentCount() external view returns (uint256)",
        "function getAgent(uint256 agentId) external view returns (tuple(uint256 agentId, string agentDomain, address agentAddress))"
    ];
    
    for (const [network, contractAddress] of Object.entries(contracts)) {
        if (!contractAddress) continue;
        
        try {
            console.log(`\n🌐 Testing ${network}...`);
            console.log(`Contract: ${contractAddress}`);
            console.log(`RPC: ${rpcs[network]}`);
            
            const provider = new ethers.JsonRpcProvider(rpcs[network]);
            const contract = new ethers.Contract(contractAddress, abi, provider);
            
            // Test getAgentCount
            const count = await contract.getAgentCount();
            console.log(`📊 Agent count: ${count.toString()}`);
            
            // If there are agents, get the first few
            if (count > 0) {
                const maxToShow = Math.min(3, Number(count));
                for (let i = 1; i <= maxToShow; i++) {
                    try {
                        const agent = await contract.getAgent(i);
                        console.log(`👤 Agent ${i}:`);
                        console.log(`   ID: ${agent.agentId.toString()}`);
                        console.log(`   Domain: ${agent.agentDomain}`);
                        console.log(`   Address: ${agent.agentAddress}`);
                        
                        // Test AgentCard fetch
                        try {
                            const agentCardUrl = `https://${agent.agentDomain}/.well-known/agent-card.json`;
                            console.log(`   AgentCard URL: ${agentCardUrl}`);
                            
                            const response = await fetch(agentCardUrl, { 
                                timeout: 5000,
                                headers: { 'Accept': 'application/json' }
                            });
                            
                            if (response.ok) {
                                const agentCard = await response.json();
                                console.log(`   ✅ AgentCard found: ${agentCard.name || 'Unnamed'}`);
                            } else {
                                console.log(`   ⚠️ AgentCard not accessible (${response.status})`);
                            }
                        } catch (cardError) {
                            console.log(`   ❌ AgentCard fetch failed: ${cardError.message}`);
                        }
                    } catch (error) {
                        console.log(`   ❌ Error fetching agent ${i}: ${error.message}`);
                    }
                }
            } else {
                console.log('   No agents registered on this network');
            }
            
        } catch (error) {
            console.error(`❌ Error testing ${network}: ${error.message}`);
        }
    }
}

// Run if this is a Node.js environment
if (typeof require !== 'undefined' && require.main === module) {
    testDiscovery().catch(console.error);
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.testDiscovery = testDiscovery;
}
