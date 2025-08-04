const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from root directory
app.use(express.static('.'));

// Database setup
const db = new sqlite3.Database(process.env.DATABASE_URL || './rowecapital.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// JWT Secret
const JWT_SECRET = 'rowecapital-secret-key-2024';

// Initialize database tables
function initializeDatabase() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        country TEXT NOT NULL,
        phone TEXT,
        affiliate_code TEXT UNIQUE NOT NULL,
        wallet_balance REAL DEFAULT 0,
        daily_earnings REAL DEFAULT 0,
        total_earnings REAL DEFAULT 0,
        withdrawable REAL DEFAULT 0,
        current_plan TEXT,
        commission_earned REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Transactions table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Referrals table
    db.run(`CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referrer_id INTEGER NOT NULL,
        referred_id INTEGER NOT NULL,
        commission REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (referrer_id) REFERENCES users (id),
        FOREIGN KEY (referred_id) REFERENCES users (id)
    )`);

    // Investment plans table
    db.run(`CREATE TABLE IF NOT EXISTS investment_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        plan_name TEXT NOT NULL,
        investment_amount REAL NOT NULL,
        daily_profit REAL NOT NULL,
        start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    console.log('Database tables initialized');
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Generate affiliate code
function generateAffiliateCode() {
    return 'ROWE' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Routes

// Enhanced user registration with better affiliate system
app.post('/api/register', async (req, res) => {
    const { fullName, email, country, password, affiliateCode } = req.body;

    // Enhanced validation
    if (!fullName || fullName.length < 2) {
        return res.status(400).json({ error: 'Full name must be at least 2 characters' });
    }

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email address required' });
    }

    if (!country || country.length < 2) {
        return res.status(400).json({ error: 'Country is required' });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        // Check if email already exists
        db.get('SELECT id FROM users WHERE email = ?', [email], (err, existingUser) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            // Hash password
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({ error: 'Password hashing failed' });
                }

                // Generate unique affiliate code
                const userAffiliateCode = generateAffiliateCode();

                // Find referrer if affiliate code provided
                let referrerId = null;
                if (affiliateCode && affiliateCode.trim() !== '') {
                    db.get('SELECT id FROM users WHERE affiliate_code = ?', [affiliateCode.trim()], (err, referrer) => {
                        if (err) {
                            return res.status(500).json({ error: 'Database error' });
                        }
                        if (referrer) {
                            referrerId = referrer.id;
                        }
                        // Continue with user creation
                        createUser();
                    });
                } else {
                    // No affiliate code provided, create user directly
                    createUser();
                }

                function createUser() {
                    // Create user
                    db.run(
                        'INSERT INTO users (full_name, email, country, password, affiliate_code, wallet_balance, withdrawable, total_earnings, commission_earned) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [fullName, email, country, hashedPassword, userAffiliateCode, 0, 0, 0, 0],
                        function(err) {
                            if (err) {
                                return res.status(500).json({ error: 'User creation failed' });
                            }

                            const userId = this.lastID;

                            // Create referral entry if referrer exists
                            if (referrerId) {
                                db.run(
                                    'INSERT INTO referrals (referrer_id, referred_id, status) VALUES (?, ?, ?)',
                                    [referrerId, userId, 'active'],
                                    (err) => {
                                        if (err) {
                                            console.error('Referral creation failed:', err);
                                        }
                                    }
                                );
                            }

                            // Generate JWT token
                            const token = jwt.sign(
                                { id: userId, email, fullName, affiliateCode: userAffiliateCode },
                                JWT_SECRET,
                                { expiresIn: '7d' }
                            );

                            res.json({
                                message: 'Registration successful',
                                token,
                                user: {
                                    id: userId,
                                    fullName,
                                    email,
                                    affiliateCode: userAffiliateCode
                                }
                            });
                        }
                    );
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Enhanced login with better validation
app.post('/api/login', async (req, res) => {
    const { email, password, rememberMe } = req.body;

    // Enhanced validation
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email address required' });
    }

    if (!password || password.length < 1) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        // Find user by email
        db.get(
            'SELECT id, full_name, email, password, affiliate_code, wallet_balance, withdrawable, total_earnings, commission_earned FROM users WHERE email = ?',
            [email],
            (err, user) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!user) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }

                // Verify password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        return res.status(500).json({ error: 'Password verification failed' });
                    }

                    if (!isMatch) {
                        return res.status(401).json({ error: 'Invalid email or password' });
                    }

                    // Generate JWT token with appropriate expiry
                    const expiresIn = rememberMe ? '30d' : '7d';
                    const token = jwt.sign(
                        { 
                            id: user.id, 
                            email: user.email, 
                            fullName: user.full_name,
                            affiliateCode: user.affiliate_code
                        },
                        JWT_SECRET,
                        { expiresIn }
                    );

                    res.json({
                        message: 'Login successful',
                        token,
                        user: {
                            id: user.id,
                            fullName: user.full_name,
                            email: user.email,
                            affiliateCode: user.affiliate_code,
                            walletBalance: user.wallet_balance,
                            withdrawable: user.withdrawable,
                            totalEarnings: user.total_earnings,
                            commissionEarned: user.commission_earned
                        }
                    });
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
    db.get(
        'SELECT id, email, name, country, phone, affiliate_code, wallet_balance, daily_earnings, total_earnings, withdrawable, commission_earned FROM users WHERE id = ?',
        [req.user.id],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    country: user.country,
                    phone: user.phone,
                    affiliateCode: user.affiliate_code,
                    walletBalance: user.wallet_balance,
                    dailyEarnings: user.daily_earnings,
                    totalEarnings: user.total_earnings,
                    withdrawable: user.withdrawable,
                    commissionEarned: user.commission_earned
                }
            });
        }
    );
});

// Update user profile
app.put('/api/profile', authenticateToken, (req, res) => {
    const { name, country, phone } = req.body;

    if (!name || !country) {
        return res.status(400).json({ error: 'Name and country are required' });
    }

    db.run(
        'UPDATE users SET name = ?, country = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, country, phone || '', req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Update failed' });
            }

            res.json({ message: 'Profile updated successfully' });
        }
    );
});

// Get user dashboard data
app.get('/api/dashboard', authenticateToken, (req, res) => {
    const userId = req.user.id;

    // Get user data
    db.get(
        'SELECT wallet_balance, daily_earnings, total_earnings, withdrawable, commission_earned FROM users WHERE id = ?',
        [userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            // Get current investment plan
            db.get(
                'SELECT plan_name, investment_amount, daily_profit, start_date FROM investment_plans WHERE user_id = ? AND status = "active" ORDER BY start_date DESC LIMIT 1',
                [userId],
                (err, plan) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    // Get recent transactions
                    db.all(
                        'SELECT type, amount, status, details, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
                        [userId],
                        (err, transactions) => {
                            if (err) {
                                return res.status(500).json({ error: 'Database error' });
                            }

                            // Get referrals
                            db.all(
                                'SELECT r.referred_id, u.name, u.email, u.country, r.commission, r.created_at FROM referrals r JOIN users u ON r.referred_id = u.id WHERE r.referrer_id = ?',
                                [userId],
                                (err, referrals) => {
                                    if (err) {
                                        return res.status(500).json({ error: 'Database error' });
                                    }

                                    res.json({
                                        user: {
                                            walletBalance: user.wallet_balance,
                                            dailyEarnings: user.daily_earnings,
                                            totalEarnings: user.total_earnings,
                                            withdrawable: user.withdrawable,
                                            commissionEarned: user.commission_earned
                                        },
                                        currentPlan: plan,
                                        transactions: transactions,
                                        referrals: referrals
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// Deposit funds
app.post('/api/deposit', authenticateToken, (req, res) => {
    const { amount, crypto, txid } = req.body;
    const userId = req.user.id;

    if (!amount || amount < 10) {
        return res.status(400).json({ error: 'Minimum deposit is 10 USDT' });
    }

    if (!txid || txid.length < 10) {
        return res.status(400).json({ error: 'Valid transaction ID required' });
    }

    // Check if TXID already exists (prevent duplicate deposits)
    db.get(
        'SELECT id FROM transactions WHERE details LIKE ? AND type = "Deposit"',
        [`%${txid}%`],
        (err, existingTx) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (existingTx) {
                return res.status(400).json({ error: 'Transaction ID already used. Please use a different TXID.' });
            }

            // Add transaction
            db.run(
                'INSERT INTO transactions (user_id, type, amount, status, details) VALUES (?, ?, ?, ?, ?)',
                [userId, 'Deposit', amount, 'Completed', `${crypto} payment verified - TXID: ${txid}`],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Transaction failed' });
                    }

                    // Update wallet balance
                    db.run(
                        'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
                        [amount, userId],
                        (err) => {
                            if (err) {
                                return res.status(500).json({ error: 'Balance update failed' });
                            }

                            // Process affiliate commission
                            processAffiliateCommission(userId, amount);

                            res.json({ 
                                message: 'Deposit successful', 
                                amount,
                                newBalance: amount // Will be updated in frontend
                            });
                        }
                    );
                }
            );
        }
    );
});

// Enhanced affiliate commission processing
function processAffiliateCommission(userId, depositAmount) {
    // Find the referrer for this user
    db.get(
        'SELECT referrer_id FROM referrals WHERE referred_id = ? AND status = "active"',
        [userId],
        (err, referral) => {
            if (err || !referral) {
                return; // No referrer found
            }

            const referrerId = referral.referrer_id;
            const commission = depositAmount * 0.20; // 20% commission

            // Update referrer's commission earned and wallet balance
            db.run(
                'UPDATE users SET commission_earned = commission_earned + ?, wallet_balance = wallet_balance + ? WHERE id = ?',
                [commission, commission, referrerId],
                (err) => {
                    if (err) {
                        console.error('Commission update failed:', err);
                        return;
                    }

                    // Add commission transaction for referrer
                    db.run(
                        'INSERT INTO transactions (user_id, type, amount, status, details) VALUES (?, ?, ?, ?, ?)',
                        [referrerId, 'Commission', commission, 'Completed', `Affiliate commission from deposit`],
                        (err) => {
                            if (err) {
                                console.error('Commission transaction failed:', err);
                            }
                        }
                    );
                }
            );
        }
    );
}

// Withdraw funds with requirements
app.post('/api/withdraw', authenticateToken, (req, res) => {
    const { amount, address, crypto } = req.body;
    const userId = req.user.id;

    if (amount < 25) {
        return res.status(400).json({ error: 'Minimum withdrawal is 25 USDT' });
    }

    // Check user's referral count
    db.get(
        'SELECT COUNT(*) as referral_count FROM referrals WHERE referrer_id = ?',
        [userId],
        (err, referralResult) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (referralResult.referral_count < 25) {
                return res.status(400).json({ 
                    error: 'You need at least 25 referrals to withdraw',
                    currentReferrals: referralResult.referral_count,
                    requiredReferrals: 25
                });
            }

            // Check withdrawable balance
            db.get(
                'SELECT withdrawable FROM users WHERE id = ?',
                [userId],
                (err, user) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    if (amount > user.withdrawable) {
                        return res.status(400).json({ 
                            error: 'Insufficient withdrawable balance',
                            available: user.withdrawable
                        });
                    }

                    // Process withdrawal
                    db.run(
                        'UPDATE users SET withdrawable = withdrawable - ? WHERE id = ?',
                        [amount, userId],
                        (err) => {
                            if (err) {
                                return res.status(500).json({ error: 'Balance update failed' });
                            }

                            // Add withdrawal transaction
                            db.run(
                                'INSERT INTO transactions (user_id, type, amount, status, details) VALUES (?, ?, ?, ?, ?)',
                                [userId, 'Withdrawal', amount, 'Pending', `${crypto} withdrawal to ${address}`],
                                function(err) {
                                    if (err) {
                                        return res.status(500).json({ error: 'Transaction failed' });
                                    }

                                    res.json({ 
                                        message: 'Withdrawal request submitted successfully',
                                        amount,
                                        newWithdrawable: user.withdrawable - amount
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// Refresh user balance (recalculate earnings)
app.post('/api/refresh-balance', authenticateToken, (req, res) => {
    const userId = req.user.id;

    // Get user's active investment plan
    db.get(
        'SELECT * FROM investment_plans WHERE user_id = ? AND status = "active"',
        [userId],
        (err, plan) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!plan) {
                return res.status(400).json({ error: 'No active investment plan found' });
            }

            // Calculate daily earnings
            const dailyEarnings = plan.daily_profit;
            
            // Update user's withdrawable balance
            db.run(
                'UPDATE users SET withdrawable = withdrawable + ?, total_earnings = total_earnings + ? WHERE id = ?',
                [dailyEarnings, dailyEarnings, userId],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Balance update failed' });
                    }

                    // Add earnings transaction
                    db.run(
                        'INSERT INTO transactions (user_id, type, amount, status, details) VALUES (?, ?, ?, ?, ?)',
                        [userId, 'Earnings', dailyEarnings, 'Completed', `Daily profit from ${plan.plan_name} plan`],
                        function(err) {
                            if (err) {
                                return res.status(500).json({ error: 'Transaction failed' });
                            }

                            res.json({ 
                                message: 'Balance refreshed successfully',
                                dailyEarnings,
                                newWithdrawable: dailyEarnings
                            });
                        }
                    );
                }
            );
        }
    );
});

// Get user statistics including referral count
app.get('/api/user-stats', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.get(
        `SELECT 
            u.wallet_balance,
            u.withdrawable,
            u.total_earnings,
            u.commission_earned,
            COUNT(r.id) as referral_count,
            ip.plan_name,
            ip.daily_profit
        FROM users u
        LEFT JOIN referrals r ON u.id = r.referrer_id
        LEFT JOIN investment_plans ip ON u.id = ip.user_id AND ip.status = 'active'
        WHERE u.id = ?
        GROUP BY u.id`,
        [userId],
        (err, stats) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            const canWithdraw = stats.withdrawable >= 25 && stats.referral_count >= 25;
            
            res.json({
                walletBalance: stats.wallet_balance,
                withdrawable: stats.withdrawable,
                totalEarnings: stats.total_earnings,
                commissionEarned: stats.commission_earned,
                referralCount: stats.referral_count,
                currentPlan: stats.plan_name,
                dailyProfit: stats.daily_profit,
                canWithdraw,
                withdrawalRequirements: {
                    minAmount: 25,
                    minReferrals: 25,
                    hasMinAmount: stats.withdrawable >= 25,
                    hasMinReferrals: stats.referral_count >= 25
                }
            });
        }
    );
});

// Upgrade investment plan
app.post('/api/upgrade-plan', authenticateToken, (req, res) => {
    const { newPlanName, newInvestment, newDailyProfit } = req.body;
    const userId = req.user.id;

    // Check wallet balance
    db.get(
        'SELECT wallet_balance FROM users WHERE id = ?',
        [userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (newInvestment > user.wallet_balance) {
                return res.status(400).json({ 
                    error: 'Insufficient wallet balance',
                    required: newInvestment,
                    available: user.wallet_balance
                });
            }

            // Check current plan
            db.get(
                'SELECT * FROM investment_plans WHERE user_id = ? AND status = "active"',
                [userId],
                (err, currentPlan) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    if (!currentPlan) {
                        return res.status(400).json({ error: 'No active plan to upgrade' });
                    }

                    // Deactivate current plan
                    db.run(
                        'UPDATE investment_plans SET status = "upgraded" WHERE id = ?',
                        [currentPlan.id],
                        (err) => {
                            if (err) {
                                return res.status(500).json({ error: 'Plan update failed' });
                            }

                            // Deduct investment from wallet
                            db.run(
                                'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?',
                                [newInvestment, userId],
                                (err) => {
                                    if (err) {
                                        return res.status(500).json({ error: 'Balance update failed' });
                                    }

                                    // Add upgrade transaction
                                    db.run(
                                        'INSERT INTO transactions (user_id, type, amount, status, details) VALUES (?, ?, ?, ?, ?)',
                                        [userId, 'Investment', newInvestment, 'Completed', `Upgraded to ${newPlanName} plan`],
                                        function(err) {
                                            if (err) {
                                                return res.status(500).json({ error: 'Transaction failed' });
                                            }

                                            // Create new investment plan
                                            db.run(
                                                'INSERT INTO investment_plans (user_id, plan_name, investment_amount, daily_profit) VALUES (?, ?, ?, ?)',
                                                [userId, newPlanName, newInvestment, newDailyProfit],
                                                (err) => {
                                                    if (err) {
                                                        return res.status(500).json({ error: 'Plan creation failed' });
                                                    }

                                                    res.json({ 
                                                        message: `Successfully upgraded to ${newPlanName} plan`,
                                                        newBalance: user.wallet_balance - newInvestment
                                                    });
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// Get user balance for plan selection
app.get('/api/user-balance', authenticateToken, (req, res) => {
    db.get(
        'SELECT wallet_balance FROM users WHERE id = ?',
        [req.user.id],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ walletBalance: user.wallet_balance });
        }
    );
});

// Select investment plan with balance validation
app.post('/api/invest', authenticateToken, (req, res) => {
    const { planName, investment, dailyProfit } = req.body;
    const userId = req.user.id;

    if (!planName || !investment || !dailyProfit) {
        return res.status(400).json({ error: 'Plan details required' });
    }

    // Check wallet balance
    db.get(
        'SELECT wallet_balance FROM users WHERE id = ?',
        [userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (investment > user.wallet_balance) {
                return res.status(400).json({ 
                    error: 'Insufficient wallet balance', 
                    required: investment,
                    available: user.wallet_balance 
                });
            }

            // Check if user already has an active plan
            db.get(
                'SELECT id FROM investment_plans WHERE user_id = ? AND status = "active"',
                [userId],
                (err, existingPlan) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    if (existingPlan) {
                        return res.status(400).json({ error: 'You already have an active investment plan. Please upgrade your current plan instead.' });
                    }

                    // Deduct investment from wallet
                    db.run(
                        'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?',
                        [investment, userId],
                        (err) => {
                            if (err) {
                                return res.status(500).json({ error: 'Balance update failed' });
                            }

                            // Add investment transaction
                            db.run(
                                'INSERT INTO transactions (user_id, type, amount, status, details) VALUES (?, ?, ?, ?, ?)',
                                [userId, 'Investment', investment, 'Completed', `${planName} plan activated`],
                                function(err) {
                                    if (err) {
                                        return res.status(500).json({ error: 'Transaction failed' });
                                    }

                                    // Create investment plan
                                    db.run(
                                        'INSERT INTO investment_plans (user_id, plan_name, investment_amount, daily_profit) VALUES (?, ?, ?, ?)',
                                        [userId, planName, investment, dailyProfit],
                                        (err) => {
                                            if (err) {
                                                return res.status(500).json({ error: 'Plan creation failed' });
                                            }

                                            res.json({ 
                                                message: `${planName} plan activated successfully`,
                                                newBalance: user.wallet_balance - investment
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// Get all transactions
app.get('/api/transactions', authenticateToken, (req, res) => {
    db.all(
        'SELECT type, amount, status, details, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id],
        (err, transactions) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({ transactions });
        }
    );
});

// Get wallet addresses
app.get('/api/wallet-addresses', (req, res) => {
    res.json({
        USDT: 'TFbtd7LiS7T746ztRiseLGMuWKFpSUuNZt',
        TRON: 'TFbtd7LiS7T746ztRiseLGMuWKFpSUuNZt',
        BTC: 'bc1q8848vzdap2fuezexlyfrp5s3lwr5dxjmmkun4d'
    });
});

// Route handlers for different pages
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/deposit', (req, res) => {
    res.sendFile(path.join(__dirname, 'deposit.html'));
});

app.get('/deposit-usdt', (req, res) => {
    res.sendFile(path.join(__dirname, 'deposit-usdt.html'));
});

app.get('/deposit-tron', (req, res) => {
    res.sendFile(path.join(__dirname, 'deposit-tron.html'));
});

app.get('/deposit-btc', (req, res) => {
    res.sendFile(path.join(__dirname, 'deposit-btc.html'));
});

app.get('/withdraw', (req, res) => {
    res.sendFile(path.join(__dirname, 'withdraw.html'));
});

app.get('/plans', (req, res) => {
    res.sendFile(path.join(__dirname, 'plans.html'));
});

app.get('/affiliate', (req, res) => {
    res.sendFile(path.join(__dirname, 'affiliate.html'));
});

app.get('/transactions', (req, res) => {
    res.sendFile(path.join(__dirname, 'transactions.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'RoweCapital Platform is running' });
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`RoweCapital server running on port ${PORT}`);
}); 

// Get affiliate statistics
app.get('/api/affiliate-stats', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.get(
        `SELECT 
            u.affiliate_code,
            u.commission_earned,
            COUNT(r.id) as total_referrals,
            COUNT(CASE WHEN r.status = 'active' THEN 1 END) as active_referrals,
            SUM(CASE WHEN t.type = 'Deposit' THEN t.amount ELSE 0 END) as total_referral_deposits
        FROM users u
        LEFT JOIN referrals r ON u.id = r.referrer_id
        LEFT JOIN transactions t ON r.referred_id = t.user_id
        WHERE u.id = ?
        GROUP BY u.id`,
        [userId],
        (err, stats) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({
                affiliateCode: stats.affiliate_code,
                commissionEarned: stats.commission_earned || 0,
                totalReferrals: stats.total_referrals || 0,
                activeReferrals: stats.active_referrals || 0,
                totalReferralDeposits: stats.total_referral_deposits || 0
            });
        }
    );
});

// Get referral list
app.get('/api/referrals', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all(
        `SELECT 
            u.full_name,
            u.email,
            u.country,
            r.status,
            r.created_at,
            SUM(CASE WHEN t.type = 'Deposit' THEN t.amount ELSE 0 END) as total_deposits
        FROM referrals r
        JOIN users u ON r.referred_id = u.id
        LEFT JOIN transactions t ON u.id = t.user_id
        WHERE r.referrer_id = ?
        GROUP BY r.id
        ORDER BY r.created_at DESC`,
        [userId],
        (err, referrals) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json(referrals);
        }
    );
}); 