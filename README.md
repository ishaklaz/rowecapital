# RoweCapital Investment Platform

A professional investment platform with real database integration, user authentication, and comprehensive investment management features.

## 🚀 Features

### ✅ **Real Database System**
- **SQLite Database**: Persistent data storage with proper relationships
- **User Management**: Real user registration, login, and profile management
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for user passwords

### ✅ **Investment Features**
- **3 Investment Plans**: Starter (10 USDT), Pro (25 USDT), Elite (50 USDT)
- **Daily Profits**: Automated daily profit calculations
- **Real-time Updates**: Live dashboard with current balances
- **Transaction History**: Complete transaction tracking

### ✅ **Payment System**
- **Multi-Crypto Support**: USDT (TRC20), TRON, Bitcoin
- **Real Wallet Addresses**: Your actual crypto addresses
- **TXID Verification**: Transaction ID validation system
- **Affiliate Commission**: 20% commission on referrals

### ✅ **User Dashboard**
- **Overview**: Wallet balance, earnings, withdrawals
- **Deposit System**: Crypto payment processing
- **Withdrawal System**: Minimum 25 USDT withdrawal
- **Investment Plans**: Plan selection and management
- **Affiliate Program**: Referral tracking and commissions
- **Profile Management**: User profile updates

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Access the Platform
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

## 📁 Project Structure

```
RoweCapital/
├── server.js              # Main backend server
├── package.json           # Dependencies and scripts
├── rowecapital.db        # SQLite database (auto-created)
├── public/               # Frontend files
│   ├── index.html        # Landing page
│   ├── dashboard.html    # User dashboard
│   ├── styles.css        # CSS styles
│   └── script.js         # Frontend JavaScript
└── README.md            # This file
```

## 🗄️ Database Schema

### Users Table
- `id`: Primary key
- `email`: User email (unique)
- `password`: Hashed password
- `name`: Full name
- `country`: User country
- `phone`: Phone number
- `affiliate_code`: Unique referral code
- `wallet_balance`: Current balance
- `daily_earnings`: Daily profit
- `total_earnings`: Total earnings
- `withdrawable`: Available for withdrawal
- `commission_earned`: Affiliate commissions

### Transactions Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `type`: Transaction type (Deposit, Withdrawal, Earnings, etc.)
- `amount`: Transaction amount
- `status`: Transaction status
- `details`: Additional details
- `created_at`: Timestamp

### Referrals Table
- `id`: Primary key
- `referrer_id`: User who referred
- `referred_id`: User who was referred
- `commission`: Commission amount
- `created_at`: Timestamp

### Investment Plans Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `plan_name`: Plan name
- `investment_amount`: Investment amount
- `daily_profit`: Daily profit amount
- `start_date`: Plan start date
- `status`: Plan status

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/transactions` - Get transaction history

### Financial Operations
- `POST /api/deposit` - Process deposit
- `POST /api/withdraw` - Process withdrawal
- `POST /api/invest` - Select investment plan

### Utilities
- `GET /api/wallet-addresses` - Get crypto addresses

## 💰 Investment Plans

| Plan | Investment | Daily Profit | ROI |
|------|------------|--------------|-----|
| Starter | 10 USDT | 6 USDT/day | 60% |
| Pro | 25 USDT | 15 USDT/day | 60% |
| Elite | 50 USDT | 35 USDT/day | 70% |

## 🔐 Security Features

- **JWT Authentication**: Secure token-based sessions
- **Password Hashing**: Bcrypt encryption
- **Input Validation**: Comprehensive form validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Protection**: Cross-origin request handling

## 🌐 Wallet Addresses

- **BTC**: `bc1q8848vzdap2fuezexlyfrp5s3lwr5dxjmmkun4d`
- **USDT (TRC20)**: `TFbtd7LiS7T746ztRiseLGMuWKFpSUuNZt`
- **TRON**: `TFbtd7LiS7T746ztRiseLGMuWKFpSUuNZt`

## 📱 Features

### User Registration
- Full name, email, country, password
- Optional affiliate code
- Terms and conditions agreement
- Email validation and duplicate checking

### User Dashboard
- Real-time balance updates
- Transaction history
- Investment plan management
- Affiliate program tracking

### Payment System
- Multi-cryptocurrency support
- TXID verification
- Minimum deposit: 10 USDT
- Minimum withdrawal: 25 USDT

### Affiliate Program
- 20% commission on referrals
- Unique affiliate codes
- Referral tracking
- Commission history

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd RoweCapital
   npm install
   ```

2. **Start Server**
   ```bash
   npm start
   ```

3. **Access Platform**
   - Open http://localhost:3000
   - Register a new account
   - Start investing!

## 🔧 Development

### Development Mode
```bash
npm run dev
```

### Database Reset
Delete `rowecapital.db` file to reset the database.

## 📊 Admin Features

- **User Management**: View all registered users
- **Transaction Monitoring**: Track all deposits and withdrawals
- **Affiliate Tracking**: Monitor referral activities
- **System Statistics**: Platform usage metrics

## 🔒 Security Notes

- All passwords are hashed using bcrypt
- JWT tokens expire after 30 days
- Input validation on all forms
- SQL injection protection implemented
- CORS enabled for API access

## 📞 Support

For technical support or questions:
- Email: support@rowecapital.com
- Phone: +44 20 7946 0958

## ⚠️ Disclaimer

This platform is for educational and research purposes only. All investments and profits are simulated. No real money is involved in this demonstration system.

---

**RoweCapital** - Grow with a world-class logistics investor 