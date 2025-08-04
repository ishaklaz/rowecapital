# 🚢 RoweCapital Investment Platform

A sophisticated crypto investment platform simulating a British shipping company's global trade operations. Built with Node.js, Express, and SQLite for educational and research purposes.

## 🌟 Features

### 💼 Investment Platform
- **Real-time Dashboard**: Live balance tracking and earnings display
- **Investment Plans**: Starter (10 USDT), Pro (25 USDT), Elite (50 USDT)
- **Daily Profits**: Automated daily profit calculations
- **Withdrawal System**: Minimum 25 USDT with 25 referral requirement

### 💰 Payment System
- **Multi-Crypto Support**: USDT (TRC20), TRON, Bitcoin
- **Real Wallet Addresses**: Secure deposit addresses for each cryptocurrency
- **TXID Verification**: Transaction ID validation system
- **Balance Management**: Real-time balance updates

### 👥 Affiliate Program
- **20% Commission**: Earn on every referral deposit
- **Unique Codes**: Auto-generated affiliate codes
- **Referral Tracking**: Complete referral management system
- **Commission Dashboard**: Real-time earnings display

### 🔐 Security & Authentication
- **JWT Authentication**: Secure token-based login system
- **Password Hashing**: Bcrypt encryption
- **Session Management**: Persistent user sessions
- **Input Validation**: Server-side and client-side validation

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT, Bcrypt
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Bootstrap 5, Font Awesome
- **Deployment**: Render, GitHub

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rowecapital-platform.git
   cd rowecapital-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open: http://localhost:3000

### Production Deployment

#### Option 1: Render (Recommended)

1. **Fork/Clone to GitHub**
   ```bash
   git clone https://github.com/yourusername/rowecapital-platform.git
   cd rowecapital-platform
   git remote set-url origin https://github.com/yourusername/rowecapital-platform.git
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit for Render deployment"
   git push origin main
   ```

3. **Deploy on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: rowecapital-platform
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

4. **Environment Variables** (Optional)
   - `NODE_ENV`: production
   - `PORT`: 10000 (auto-set by Render)
   - `DATABASE_URL`: (auto-managed by Render)

#### Option 2: Manual Deployment

1. **Prepare for deployment**
   ```bash
   npm install --production
   ```

2. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export PORT=10000
   ```

3. **Start the application**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
rowecapital-platform/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── render.yaml            # Render deployment config
├── .gitignore            # Git ignore rules
├── README.md             # This file
├── index.html            # Landing page
├── dashboard.html        # User dashboard
├── deposit.html          # Deposit selection page
├── deposit-usdt.html     # USDT deposit page
├── deposit-tron.html     # TRON deposit page
├── deposit-btc.html      # Bitcoin deposit page
├── withdraw.html         # Withdrawal page
├── plans.html            # Investment plans
├── affiliate.html        # Affiliate program
├── transactions.html     # Transaction history
├── profile.html          # User profile
├── script.js             # Frontend JavaScript
├── styles.css            # CSS styles
└── rowecapital.db       # SQLite database
```

## 🔧 Configuration

### Database
- **Type**: SQLite3
- **File**: `rowecapital.db`
- **Tables**: users, transactions, referrals, investment_plans

### Authentication
- **Method**: JWT (JSON Web Tokens)
- **Secret**: Configured in server.js
- **Session**: Persistent with cookies

### Payment Addresses
- **USDT TRC20**: `TFbtd7LiS7T746ztRiseLGMuWKFpSUuNZt`
- **TRON**: `TFbtd7LiS7T746ztRiseLGMuWKFpSUuNZt`
- **Bitcoin**: `bc1q8848vzdap2fuezexlyfrp5s3lwr5dxjmmkun4d`

## 📊 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `POST /api/refresh-balance` - Refresh user balance

### Transactions
- `POST /api/deposit` - Submit deposit
- `POST /api/withdraw` - Request withdrawal
- `GET /api/transactions` - Get transaction history

### Investment
- `POST /api/upgrade-plan` - Upgrade investment plan
- `GET /api/plans` - Get available plans

### Affiliate
- `GET /api/affiliate` - Get affiliate data
- `GET /api/referrals` - Get referral list

## 🎯 Key Features

### Investment Plans
1. **Starter Plan**
   - Investment: 10 USDT
   - Daily Profit: 6 USDT
   - Duration: Continuous

2. **Pro Plan**
   - Investment: 25 USDT
   - Daily Profit: 15 USDT
   - Duration: Continuous

3. **Elite Plan**
   - Investment: 50 USDT
   - Daily Profit: 35 USDT
   - Duration: Continuous

### Withdrawal Requirements
- **Minimum Amount**: 25 USDT
- **Referral Requirement**: 25 active referrals
- **Processing Time**: 24-48 hours

### Affiliate Program
- **Commission Rate**: 20% of referral deposits
- **Code Generation**: Automatic unique codes
- **Tracking**: Complete referral history

## 🔒 Security Notes

⚠️ **IMPORTANT**: This is a simulation platform for educational purposes only.

- No real cryptocurrency transactions
- All balances are simulated
- No actual withdrawals processed
- Database resets on deployment
- Educational/research use only

## 🚀 Deployment Checklist

### Before Deployment
- [ ] All files in root directory
- [ ] `package.json` updated
- [ ] `render.yaml` configured
- [ ] `.gitignore` created
- [ ] Database path configured
- [ ] Static files served from root

### Render Deployment
- [ ] GitHub repository connected
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables set
- [ ] Health check path: `/`
- [ ] Auto-deploy enabled

### Post-Deployment
- [ ] Database initialized
- [ ] Routes working correctly
- [ ] Static files served
- [ ] Authentication functional
- [ ] Payment system operational

## 📞 Support

For deployment issues or questions:
1. Check Render build logs
2. Verify environment variables
3. Test local deployment first
4. Review server logs

## 📄 License

MIT License - Educational use only.

---

**RoweCapital Platform** - Grow with a world-class logistics investor 🚢 