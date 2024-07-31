# CC-INVEST-CAT

## 專案簡介

CC-INVEST-CAT 是一個加密貨幣市場的模擬交易平台。這個應用程式允許用戶在不涉及真實資金的情況下，體驗加密貨幣交易的過程，學習交易策略，並熟悉市場動態。

## 功能詳解

### 用戶註冊和登入系統
- 用戶可以創建新帳戶或使用已有帳戶登入。
- 支持 JWT 驗證確保安全性。

### 模擬多種加密貨幣的即時市場數據
- 通過 Binance API 獲取實時市場數據，提供準確的價格和變化趨勢。

### 虛擬資金管理
- 每個用戶都會獲得一定的虛擬資金，供他們進行交易操作。

### 買入和賣出加密貨幣的模擬交易
- 支持市場訂單類型的交易操作，模擬實際市場的交易行為。

### 交易歷史記錄和投資組合追蹤
- 用戶可以查看自己的交易歷史。

### 基本的市場分析工具
- 提供基本的圖表和指標，幫助用戶進行市場分析和決策。

## 系統架構

![系統架構圖](https://cc-invest-cat-s3.s3.ap-northeast-1.amazonaws.com/Screenshot+2024-07-26+at+11.48.17.png)

系統架構包括以下主要組件：

### 前端
- **React**: 用於構建用戶界面
- **AWS CloudFront**: 用於內容分發
- **AWS S3**: 用於靜態資源存儲

### 後端
- **AWS EC2**: 運行主要的應用服務器
- **Docker**: 容器化的 Node.js 應用和 Socket.io 服務
- **AWS Load Balancer**: 用於分配流量
- **MongoDB**: 用於數據存儲
- **Binance API**: 用於獲取加密貨幣市場數據
- **Discord API**: 用於通知和互動
- **Kafka**: 用於消息隊列和事件流處理

## 主要功能

- 用戶註冊和登入系統
- 模擬多種加密貨幣的即時市場數據
- 虛擬資金管理
- 買入和賣出加密貨幣的模擬交易
- 交易歷史記錄和投資組合追蹤
- 基本的市場分析工具

## 技術棧

- **前端**: React.js, Material-UI
- **後端**: Node.js, Express.js
- **數據庫**: MongoDB
- **API**: RESTful API, Binance API, Discord API
- **消息隊列**: Kafka
- **雲服務**: AWS
- **其他**: Discord Bot 集成

## 安裝指南

1. 克隆儲存庫:
    ```sh
    git clone https://github.com/wilson-Shepherd/CC-INVEST-CAT.git
    ```

2. 安裝依賴:
    ```sh
    cd server
    npm install
    ```

3. 設置環境變數:
    創建一個 `.env` 文件，並添加必要的配置。細節請參考下方`環境變數` 。

4. 運行應用:
    ```sh
    npm start
    ```

## 環境變數

本項目使用以下環境變數。請確保在運行應用之前正確設置這些變數：

| 變數名稱                    | 說明                     |
|-----------------------------|--------------------------|
| `PORT`                      | 應用程序運行的端口       |
| `MONGO_URI`                 | MongoDB 連接字符串       |
| `JWT_KEY`                   | 用於 JWT 加密的密鑰      |
| `TESTNET_BINANCE_API_KEY`   | Binance Testnet API 密鑰 |
| `TESTNET_BINANCE_API_SECRET`| Binance Testnet API 密鑰 |
| `DISCORD_TOKEN`             | Discord Bot 令牌         |
| `DISCORD_CLIENT_ID`         | Discord 客戶端 ID        |
| `DISCORD_CHANNEL_ID`        | Discord 頻道 ID          |
| `EMAIL`                     | 用於發送郵件的郵箱地址  |
| `PASSWORD`                  | 郵箱密碼                 |
| `AWS_ACCESS_KEY_ID`         | AWS 訪問密鑰 ID          |
| `AWS_SECRET_ACCESS_KEY`     | AWS 訪問密鑰             |
| `AWS_REGION`                | AWS 區域                 |
| `KAFKA_BROKER`              | Kafka 代理地址           |

注意：請不要將包含實際值的 `.env` 文件提交到版本控制系統中。

## 使用指南

1. 註冊一個新帳戶或使用測試帳戶登入
2. 瀏覽可用的加密貨幣列表
3. 使用虛擬資金進行買入或賣出操作
4. 追蹤您的投資組合和交易歷史
5. 使用分析工具來輔助決策

## 貢獻指南

歡迎任何形式的貢獻。如果您想為這個項目做出貢獻，請遵循以下步驟：

1. Fork 該儲存庫
2. 創建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟一個 Pull Request

## 聯繫方式

專案維護者: Wilson Shepherd - wilsonlmk23512@gmail.com

專案鏈接: [https://app.cc-invest-cat.com](https://app.cc-invest-cat.com)
