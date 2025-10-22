# my_agent — 本地 Agent 注册示例

简介
----
本目录包含一个本地演示用的 agent 注册示例：
- `registor.js`：使用 ethers.js (v6) 调用已部署的 `IdentityRegistry` 合约，发送 `register(tokenURI)`，等待交易确认，解析 `Transfer` 事件得到 `tokenId`（agentId），并调用 `ownerOf` / `tokenURI` 验证结果。
- `registration.json`：示例 agent-card（元数据），脚本会将其作为 `tokenURI` 上链。

先决条件
--------
- Node.js >= 18
- npm 或 yarn
- Foundry（anvil）用于本地链（可选，但推荐用于测试）
- 已安装依赖：在仓库根目录运行 `npm install`（项目 `package.json` 已声明 `ethers`）
- 在本地部署（或已有） `IdentityRegistry` 合约地址
- 本地测试使用 anvil 的默认账户或临时测试私钥即可，一旦私钥被提交到远程仓库，务必立即撤销并替换。

快速使用步骤（本地测试）
-----------------------

1. 启动本地链（anvil）：
   ```bash
   anvil
   ```
   anvil 会输出一组默认账户和私钥（这些账户会带大量测试 ETH）。复制其中一个私钥备用，或者直接使用默认账户。

2. 在项目根创建 `.env`（强烈建议）：
   ```
   PRIVATE_KEY=0x...
   RPC_URL=http://127.0.0.1:8545
   ```


3. 启动 `registration.json` 静态服务（在 `my_agent` 目录）：
   ```bash
   cd my_agent
   python3 -m http.server 3000
   ```
   （或 `npx serve . -l 3000`）

4. 编辑 `my_agent/registor.js`：
    运行把项目中的identityRegistry部署至anvil:
   ```forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --private-key <你的私钥> --broadcast
   ```
   - 确认 `identityRegistryAddress` 为你部署的合约地址，或改为从配置/环境读取。
   - 脚本已读取 `process.env.PRIVATE_KEY` 和 `process.env.RPC_URL`（如果你接受了自动修改）。

5. 运行注册脚本：
   ```bash
   node my_agent/registor.js
   ```
   输出会包含：交易哈希、tokenId、gas 用量、合约地址、NFT 持有者地址、tokenURI 链接等。

常见问题与解决
---------------
- 私钥解析错误：确保 `.env` 中 `PRIVATE_KEY` 以 `0x` 开头。
- 余额不足：确保你签名账户有足够测试 ETH。anvil 默认账户有大量 ETH，或使用 `cast send` 从默认账户转账给目标地址：
  ```bash
  cast send <你的地址> --value 10ether --private-key <anvil-default-privkey> --rpc-url http://127.0.0.1:8545
  ```
- `TypeError: identityRegistry.ownerOf is not a function`：在 ABI 中添加 `function ownerOf(uint256 tokenId) view returns (address)`。
- ethers v6 注意：`receipt.hash` 包含交易哈希；v5 中为 `receipt.transactionHash`。
- 运行
```
forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --private-key <你的私钥> --broadcast
```
之后 我的anvil是如何指导其deploy的地址的?

通过终端输出的:
IdentityRegistry deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3



其他说明
--------
- `agentId` 即 NFT 的 `tokenId`，合约在 `register` 调用时自动分配。
- `tokenURI` 应该指向可被访问的 JSON 文件（例如 `http://127.0.0.1:3000/agent/registration.json`）。
