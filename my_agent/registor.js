// Use environment variables for secrets and RPC URL
import 'dotenv/config';
import { ethers } from "ethers";

// 1) 连接到你的本地 Anvil 节点，优先使用环境变量 RPC_URL
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");

// 2) 从 .env 中读取私钥，确保 PRIVATE_KEY 以 0x 开头
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error('Missing PRIVATE_KEY in environment. Create a .env file with PRIVATE_KEY=0x...');
  process.exit(1);
}
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 3) 指定 IdentityRegistry 的合约地址（你部署后得到的地址）
const identityRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // 本地部署的地址

// 4) 合约 ABI（最简）
const abi = [
  "function register(string tokenURI) returns (uint256)",
  "function tokenURI(uint256 agentId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)", // ← 加这一行 才能用 ownerOf 查询持有者
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// 5) 创建合约实例
const identityRegistry = new ethers.Contract(identityRegistryAddress, abi, wallet);

// 6) 调用 register() 注册代理
const main = async () => {
  console.log("正在注册代理...");

  //  JSON 文件在本地 HTTP 服务器上
  const tokenURI = "http://127.0.0.1:3000/agent/registration.json";

  // 发起交易
  const tx = await identityRegistry.register(tokenURI);
  console.log("交易已发送:", tx.hash);

  // 等待上链
  const receipt = await tx.wait();
  // ethers v6 uses `hash` for the transaction hash
  console.log("交易已确认:", receipt.hash);

  // 解析 Transfer 事件，获取 tokenId
  const iface = new ethers.Interface(abi);
  let tokenId;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed.name === "Transfer") {
        tokenId = parsed.args.tokenId;
        console.log("注册完成！Agent NFT 已铸造。其tokenid如下:", tokenId.toString());
      }
    } catch (e) {
      // 跳过无法解析的日志
    }
  }

  console.log("Gas 用量:", receipt.gasUsed.toString());
  console.log("合约地址:", receipt.to);


  if (tokenId) {
    // 查询 NFT 持有者
    const owner = await identityRegistry.ownerOf(tokenId);
    console.log("NFT 持有者:", owner);
    console.log("你的钱包地址:", wallet.address);

    // 查询 NFT 的注册文件链接
    const uri = await identityRegistry.tokenURI(tokenId);
    console.log("NFT 注册文件链接:", uri);
  } else {
    console.log("未能获取到 agentId/tokenId，无法查询 owner/tokenURI。");
  }
  //agent id/ tokenId 即为 receipt.logs 里 Transfer 事件的第三个参数或者event的返回参数
  console.log("注意:", receipt.hash);

};

main().catch(console.error);