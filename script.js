// RoweCapital Platform JavaScript
// Real API integration with backend server

// Global variables
let currentUser = null;
let userData = {
    walletBalance: 0,
    dailyEarnings: 0,
    totalEarnings: 0,
    withdrawable: 0,
    currentPlan: null,
    transactions: [],
    referrals: [],
    affiliateCode: '',
    commissionEarned: 0
};

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Token management
function getToken() {
    return localStorage.getItem('roweCapitalToken');
}

function setToken(token) {
    localStorage.setItem('roweCapitalToken', token);
}

function removeToken() {
    localStorage.removeItem('roweCapitalToken');
}

// API Helper functions
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...options
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateName(name) {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name);
}

function validateAffiliateCode(code) {
    if (!code) return true;
    return code.length >= 6;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check if user is logged in
    const token = getToken();
    if (token) {
        // Verify token and load user data
        loadUserProfile();
    }

    // Setup event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Landing page event listeners
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Dashboard event listeners
    const depositForm = document.getElementById('depositForm');
    const withdrawForm = document.getElementById('withdrawForm');
    const profileForm = document.getElementById('profileForm');
    
    if (depositForm) {
        setupDepositForm();
    }
    if (withdrawForm) {
        withdrawForm.addEventListener('submit', handleWithdraw);
    }
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
}

// Modal functions
function showLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

function showSignupModal() {
    const modal = new bootstrap.Modal(document.getElementById('signupModal'));
    modal.show();
}

// Authentication functions
// Enhanced login function with better validation
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Client-side validation
    if (!email || !email.includes('@')) {
        showAlert('Please enter a valid email address', 'warning');
        return;
    }
    
    if (!password || password.length < 1) {
        showAlert('Please enter your password', 'warning');
        return;
    }
    
    try {
        showLoading();
        
        const response = await apiCall('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, rememberMe })
        });
        
        // Store token and user data
        setToken(response.token);
        currentUser = response.user;
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
        
    } catch (error) {
        if (error.message.includes('Invalid email or password')) {
            showAlert('Invalid email or password. Please try again.', 'danger');
        } else {
            showAlert(error.message || 'Login failed. Please try again.', 'danger');
        }
    } finally {
        hideLoading();
    }
}

// Enhanced signup function with better validation
async function handleSignup(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('signupFullName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const country = document.getElementById('signupCountry').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const affiliateCode = document.getElementById('signupAffiliateCode').value.trim();
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Client-side validation
    if (!fullName || fullName.length < 2) {
        showAlert('Full name must be at least 2 characters', 'warning');
        return;
    }
    
    if (!email || !email.includes('@')) {
        showAlert('Please enter a valid email address', 'warning');
        return;
    }
    
    if (!country || country.length < 2) {
        showAlert('Please enter your country', 'warning');
        return;
    }
    
    if (!password || password.length < 6) {
        showAlert('Password must be at least 6 characters', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'warning');
        return;
    }
    
    if (!agreeTerms) {
        showAlert('Please agree to the terms and conditions', 'warning');
        return;
    }
    
    try {
        showLoading();
        
        const response = await apiCall('/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, country, password, affiliateCode })
        });
        
        // Store token and user data
        setToken(response.token);
        currentUser = response.user;
        
        showAlert('Registration successful! Welcome to RoweCapital.', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1500);
        
    } catch (error) {
        if (error.message.includes('Email already registered')) {
            showAlert('This email is already registered. Please login instead.', 'warning');
        } else if (error.message.includes('Invalid affiliate code')) {
            showAlert('Invalid affiliate code. Please check and try again.', 'warning');
        } else {
            showAlert(error.message || 'Registration failed. Please try again.', 'danger');
        }
    } finally {
        hideLoading();
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        const response = await apiCall('/profile');
        currentUser = response.user;
        
        if (window.location.pathname.includes('dashboard')) {
            await loadDashboardData();
        }
    } catch (error) {
        // Token might be invalid, remove it
        removeToken();
        if (window.location.pathname.includes('dashboard')) {
            window.location.href = '/';
        }
    }
}

// Load user statistics including withdrawal requirements
async function loadUserStats() {
    try {
        const response = await apiCall('/user-stats');
        
        // Update withdrawal requirements display
        const withdrawalRequirements = document.getElementById('withdrawalRequirements');
        if (withdrawalRequirements) {
            const req = response.withdrawalRequirements;
            withdrawalRequirements.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="requirement-item ${req.hasMinAmount ? 'met' : 'not-met'}">
                            <i class="fas ${req.hasMinAmount ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'}"></i>
                            <span>Minimum 25 USDT: ${response.withdrawable.toFixed(2)}/25</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="requirement-item ${req.hasMinReferrals ? 'met' : 'not-met'}">
                            <i class="fas ${req.hasMinReferrals ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'}"></i>
                            <span>25 Referrals: ${response.referralCount}/25</span>
                        </div>
                    </div>
                </div>
                <div class="mt-2">
                    <button class="btn btn-primary" onclick="handleWithdraw(event)" ${response.canWithdraw ? '' : 'disabled'}>
                        ${response.canWithdraw ? 'Withdraw Now' : 'Requirements Not Met'}
                    </button>
                </div>
            `;
        }
        
        // Update balance display
        const balanceElement = document.getElementById('walletBalance');
        if (balanceElement) {
            balanceElement.textContent = response.walletBalance.toFixed(2);
        }
        
        const withdrawableElement = document.getElementById('withdrawableBalance');
        if (withdrawableElement) {
            withdrawableElement.textContent = response.withdrawable.toFixed(2);
        }
        
        // Update referral count
        const referralCountElement = document.getElementById('referralCount');
        if (referralCountElement) {
            referralCountElement.textContent = response.referralCount;
        }
        
        // Update current plan display
        const currentPlanElement = document.getElementById('currentPlan');
        if (currentPlanElement) {
            if (response.currentPlan) {
                currentPlanElement.innerHTML = `
                    <div class="plan-info">
                        <h6>${response.currentPlan}</h6>
                        <p>Daily Profit: ${response.dailyProfit} USDT</p>
                        <button class="btn btn-sm btn-outline-primary" onclick="refreshBalance()">
                            <i class="fas fa-sync-alt me-1"></i>Refresh Balance
                        </button>
                    </div>
                `;
            } else {
                currentPlanElement.innerHTML = '<span class="text-muted">No active plan</span>';
            }
        }
        
    } catch (error) {
        console.error('Failed to load user stats:', error);
    }
}

// Enhanced dashboard update with affiliate data
async function loadDashboardData() {
    try {
        const response = await apiCall('/dashboard');
        
        userData = {
            walletBalance: response.user.walletBalance,
            dailyEarnings: response.user.dailyEarnings,
            totalEarnings: response.user.totalEarnings,
            withdrawable: response.user.withdrawable,
            currentPlan: response.currentPlan,
            transactions: response.transactions,
            referrals: response.referrals,
            affiliateCode: currentUser.affiliateCode,
            commissionEarned: response.user.commissionEarned
        };
        
        updateDashboard();
        updatePlanCards();
        
        // Load additional stats
        await loadUserStats();
        await loadAffiliateStats();
        await loadReferralList();
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// Dashboard functions
function updateDashboard() {
    if (!currentUser) return;
    
    // Update user name
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = currentUser.name;
    }
    
    // Update stats
    const walletBalanceElement = document.getElementById('walletBalance');
    const dailyEarningsElement = document.getElementById('dailyEarnings');
    const totalEarningsElement = document.getElementById('totalEarnings');
    const withdrawableElement = document.getElementById('withdrawable');
    const availableWithdrawElement = document.getElementById('availableWithdraw');
    
    if (walletBalanceElement) {
        walletBalanceElement.textContent = userData.walletBalance.toFixed(2) + ' USDT';
    }
    if (dailyEarningsElement) {
        dailyEarningsElement.textContent = userData.dailyEarnings.toFixed(2) + ' USDT';
    }
    if (totalEarningsElement) {
        totalEarningsElement.textContent = userData.totalEarnings.toFixed(2) + ' USDT';
    }
    if (withdrawableElement) {
        withdrawableElement.textContent = userData.withdrawable.toFixed(2) + ' USDT';
    }
    if (availableWithdrawElement) {
        availableWithdrawElement.textContent = userData.withdrawable.toFixed(2);
    }
    
    // Update current plan
    updateCurrentPlan();
    
    // Update transactions
    updateTransactions();
    
    // Update affiliate data
    updateAffiliateData();
}

function updateCurrentPlan() {
    const currentPlanDiv = document.getElementById('currentPlan');
    const nextPaymentDiv = document.getElementById('nextPayment');
    
    if (!currentPlanDiv || !nextPaymentDiv) return;
    
    if (userData.currentPlan) {
        currentPlanDiv.innerHTML = `
            <h6>${userData.currentPlan.plan_name}</h6>
            <p class="text-success">Daily Profit: ${userData.currentPlan.daily_profit} USDT</p>
            <p class="text-muted">Investment: ${userData.currentPlan.investment_amount} USDT</p>
            <button class="btn btn-outline-primary btn-sm" onclick="upgradePlan()">Upgrade Plan</button>
        `;
        
        // Calculate next payment time
        const now = new Date();
        const nextPayment = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        nextPaymentDiv.innerHTML = `
            <h6>${nextPayment.toLocaleDateString()}</h6>
            <p class="text-muted">Next daily profit distribution</p>
        `;
    } else {
        currentPlanDiv.innerHTML = `
            <p class="text-muted">No active investment plan</p>
            <button class="btn btn-primary" onclick="showSection('plans')">Choose a Plan</button>
        `;
        nextPaymentDiv.innerHTML = `
            <p class="text-muted">No active investment</p>
        `;
    }
}

function updateTransactions() {
    const recentTransactions = document.getElementById('recentTransactions');
    const allTransactions = document.getElementById('allTransactions');
    
    if (!recentTransactions || !allTransactions) return;
    
    if (userData.transactions.length === 0) {
        recentTransactions.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No transactions yet</td></tr>';
        allTransactions.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No transactions yet</td></tr>';
        return;
    }
    
    // Show recent transactions (last 5)
    const recent = userData.transactions.slice(0, 5);
    recentTransactions.innerHTML = recent.map(tx => `
        <tr>
            <td><span class="badge bg-${getTransactionBadgeColor(tx.type)}">${tx.type}</span></td>
            <td>${tx.amount} USDT</td>
            <td><span class="badge bg-${getStatusBadgeColor(tx.status)}">${tx.status}</span></td>
            <td>${new Date(tx.created_at).toLocaleDateString()}</td>
        </tr>
    `).join('');
    
    // Show all transactions
    allTransactions.innerHTML = userData.transactions.map(tx => `
        <tr>
            <td><span class="badge bg-${getTransactionBadgeColor(tx.type)}">${tx.type}</span></td>
            <td>${tx.amount} USDT</td>
            <td><span class="badge bg-${getStatusBadgeColor(tx.status)}">${tx.status}</span></td>
            <td>${new Date(tx.created_at).toLocaleDateString()}</td>
            <td>${tx.details || ''}</td>
        </tr>
    `).join('');
}

function updateAffiliateData() {
    const affiliateCodeElement = document.getElementById('affiliateCode');
    const referralCountElement = document.getElementById('referralCount');
    const commissionEarnedElement = document.getElementById('commissionEarned');
    const referralHistoryElement = document.getElementById('referralHistory');
    
    if (!affiliateCodeElement || !referralCountElement || !commissionEarnedElement || !referralHistoryElement) return;
    
    affiliateCodeElement.value = userData.affiliateCode;
    referralCountElement.textContent = userData.referrals.length;
    commissionEarnedElement.textContent = userData.commissionEarned.toFixed(2) + ' USDT';
    
    if (userData.referrals.length === 0) {
        referralHistoryElement.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No referrals yet</td></tr>';
    } else {
        referralHistoryElement.innerHTML = userData.referrals.map(ref => `
            <tr>
                <td>${ref.name}</td>
                <td>${ref.email}</td>
                <td>${ref.country}</td>
                <td>${new Date(ref.created_at).toLocaleDateString()}</td>
                <td>${ref.commission} USDT</td>
            </tr>
        `).join('');
    }
}

// Load affiliate statistics
async function loadAffiliateStats() {
    try {
        const response = await apiCall('/affiliate-stats');
        
        // Update affiliate section
        const affiliateCodeElement = document.getElementById('affiliateCode');
        if (affiliateCodeElement) {
            affiliateCodeElement.textContent = response.affiliateCode;
        }
        
        const commissionEarnedElement = document.getElementById('commissionEarned');
        if (commissionEarnedElement) {
            commissionEarnedElement.textContent = response.commissionEarned.toFixed(2);
        }
        
        const totalReferralsElement = document.getElementById('totalReferrals');
        if (totalReferralsElement) {
            totalReferralsElement.textContent = response.totalReferrals;
        }
        
        const activeReferralsElement = document.getElementById('activeReferrals');
        if (activeReferralsElement) {
            activeReferralsElement.textContent = response.activeReferrals;
        }
        
        const totalReferralDepositsElement = document.getElementById('totalReferralDeposits');
        if (totalReferralDepositsElement) {
            totalReferralDepositsElement.textContent = response.totalReferralDeposits.toFixed(2);
        }
        
    } catch (error) {
        console.error('Failed to load affiliate stats:', error);
    }
}

// Load referral list
async function loadReferralList() {
    try {
        const response = await apiCall('/referrals');
        
        const referralListElement = document.getElementById('referralList');
        if (referralListElement) {
            if (response.length === 0) {
                referralListElement.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted">
                            No referrals yet. Share your affiliate code to start earning!
                        </td>
                    </tr>
                `;
            } else {
                referralListElement.innerHTML = response.map(referral => `
                    <tr>
                        <td>${referral.full_name}</td>
                        <td>${referral.email}</td>
                        <td>${referral.country}</td>
                        <td>
                            <span class="badge ${referral.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                                ${referral.status}
                            </span>
                        </td>
                        <td>${referral.total_deposits.toFixed(2)} USDT</td>
                        <td>${new Date(referral.created_at).toLocaleDateString()}</td>
                    </tr>
                `).join('');
            }
        }
        
    } catch (error) {
        console.error('Failed to load referral list:', error);
    }
}

// Copy affiliate code to clipboard
function copyAffiliateCode() {
    const affiliateCode = document.getElementById('affiliateCode');
    if (affiliateCode) {
        const code = affiliateCode.textContent;
        navigator.clipboard.writeText(code).then(() => {
            showAlert('Affiliate code copied to clipboard!', 'success');
        }).catch(() => {
            showAlert('Failed to copy affiliate code', 'warning');
        });
    }
}

// Section navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

// Deposit functions
async function handleDeposit(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('depositAmount').value);
    const crypto = document.querySelector('input[name="crypto"]:checked').value;
    
    if (amount < 10) {
        showAlert('Minimum deposit is 10 USDT', 'warning');
        return;
    }
    
    // Show payment details
    const paymentAmountElement = document.getElementById('paymentAmount');
    const paymentAddressElement = document.getElementById('paymentAddress');
    const paymentDetailsElement = document.getElementById('paymentDetails');
    
    if (paymentAmountElement && paymentAddressElement && paymentDetailsElement) {
        paymentAmountElement.value = amount + ' ' + crypto;
        paymentAddressElement.value = walletAddresses[crypto];
        paymentDetailsElement.style.display = 'block';
        
        // Show payment instructions
        showAlert(`Please send exactly ${amount} ${crypto} to the address above. After payment, enter your Transaction ID (TXID) and click "Verify Payment".`, 'info');
    }
}

async function verifyPayment() {
    const txid = document.getElementById('txid').value.trim();
    
    if (!txid) {
        showAlert('Please enter the transaction ID', 'warning');
        return;
    }

    if (txid.length < 10) {
        showAlert('Transaction ID must be at least 10 characters', 'warning');
        return;
    }
    
    try {
        showLoading();
        
        const amount = parseFloat(document.getElementById('depositAmount').value);
        const crypto = document.querySelector('input[name="crypto"]:checked').value;
        
        const response = await apiCall('/deposit', {
            method: 'POST',
            body: JSON.stringify({ amount, crypto, txid })
        });
        
        // Reload dashboard data
        await loadDashboardData();
        
        // Hide payment details
        const paymentDetailsElement = document.getElementById('paymentDetails');
        if (paymentDetailsElement) {
            paymentDetailsElement.style.display = 'none';
        }
        
        // Reset form
        const depositForm = document.getElementById('depositForm');
        if (depositForm) {
            depositForm.reset();
        }
        
        showAlert(`Payment verified successfully! ${amount} USDT added to your wallet.`, 'success');
        
    } catch (error) {
        showAlert(error.message || 'Payment verification failed.', 'danger');
    } finally {
        hideLoading();
    }
}

// Investment plan functions with balance checking
async function selectPlan(planName, investment, dailyProfit) {
    try {
        showLoading();
        
        // First check user's current balance
        const balanceResponse = await apiCall('/user-balance');
        const currentBalance = balanceResponse.walletBalance;
        
        if (currentBalance < investment) {
            const shortfall = investment - currentBalance;
            showAlert(`Insufficient balance. You need ${shortfall.toFixed(2)} more USDT to select the ${planName} plan. Please deposit more funds first.`, 'warning');
            hideLoading();
            return;
        }
        
        const response = await apiCall('/invest', {
            method: 'POST',
            body: JSON.stringify({ planName, investment, dailyProfit })
        });
        
        // Reload dashboard data
        await loadDashboardData();
        
        showAlert(`${planName} plan activated successfully! ${investment} USDT deducted from your wallet.`, 'success');
        
    } catch (error) {
        if (error.message.includes('already have an active investment plan')) {
            showAlert('You already have an active investment plan. Please upgrade your current plan instead.', 'warning');
        } else if (error.message.includes('Insufficient wallet balance')) {
            const shortfall = investment - (error.available || 0);
            showAlert(`Insufficient balance. You need ${shortfall.toFixed(2)} more USDT to select the ${planName} plan.`, 'warning');
        } else {
            showAlert(error.message || 'Investment failed.', 'danger');
        }
    } finally {
        hideLoading();
    }
}

// Update plan cards to show balance requirements
function updatePlanCards() {
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        const button = card.querySelector('.btn');
        const planName = card.querySelector('.card-title').textContent;
        const priceElement = card.querySelector('.price');
        const investment = parseFloat(priceElement.textContent);
        
        // Check if user has sufficient balance
        if (userData.walletBalance < investment) {
            button.classList.remove('btn-primary');
            button.classList.add('btn-secondary');
            button.textContent = 'Insufficient Balance';
            button.disabled = true;
        } else {
            button.classList.remove('btn-secondary');
            button.classList.add('btn-primary');
            button.textContent = 'Select Plan';
            button.disabled = false;
        }
    });
}

// Balance refresh function
async function refreshBalance() {
    try {
        showLoading();
        
        const response = await apiCall('/refresh-balance', {
            method: 'POST'
        });
        
        // Reload dashboard data
        await loadDashboardData();
        
        showAlert(`Balance refreshed! ${response.dailyEarnings} USDT added to your withdrawable balance.`, 'success');
        
    } catch (error) {
        if (error.message.includes('No active investment plan')) {
            showAlert('You need an active investment plan to refresh balance.', 'warning');
        } else {
            showAlert(error.message || 'Balance refresh failed.', 'danger');
        }
    } finally {
        hideLoading();
    }
}

// Upgrade plan function
async function upgradePlan(newPlanName, newInvestment, newDailyProfit) {
    try {
        showLoading();
        
        const response = await apiCall('/upgrade-plan', {
            method: 'POST',
            body: JSON.stringify({ newPlanName, newInvestment, newDailyProfit })
        });
        
        // Reload dashboard data
        await loadDashboardData();
        
        showAlert(`Successfully upgraded to ${newPlanName} plan!`, 'success');
        
    } catch (error) {
        if (error.message.includes('Insufficient wallet balance')) {
            const shortfall = newInvestment - (error.available || 0);
            showAlert(`Insufficient balance. You need ${shortfall.toFixed(2)} more USDT to upgrade to ${newPlanName}.`, 'warning');
        } else if (error.message.includes('No active plan to upgrade')) {
            showAlert('You need an active investment plan to upgrade.', 'warning');
        } else {
            showAlert(error.message || 'Plan upgrade failed.', 'danger');
        }
    } finally {
        hideLoading();
    }
}

// Enhanced withdrawal with requirements checking
async function handleWithdraw(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const address = document.getElementById('withdrawAddress').value.trim();
    const crypto = document.getElementById('withdrawCrypto').value;
    
    // Validation
    if (amount < 25) {
        showAlert('Minimum withdrawal is 25 USDT', 'warning');
        return;
    }
    
    if (!address) {
        showAlert('Please enter your wallet address', 'warning');
        return;
    }

    if (address.length < 10) {
        showAlert('Please enter a valid wallet address', 'warning');
        return;
    }
    
    try {
        showLoading();
        
        const response = await apiCall('/withdraw', {
            method: 'POST',
            body: JSON.stringify({ amount, address, crypto })
        });
        
        // Reload dashboard data
        await loadDashboardData();
        
        // Reset form
        const withdrawForm = document.getElementById('withdrawForm');
        if (withdrawForm) {
            withdrawForm.reset();
        }
        
        showAlert('Withdrawal request submitted successfully! It will be processed within 24 hours.', 'success');
        
    } catch (error) {
        if (error.message.includes('need at least 25 referrals')) {
            showAlert(`You need at least 25 referrals to withdraw. Current referrals: ${error.currentReferrals || 0}/25`, 'warning');
        } else if (error.message.includes('Insufficient withdrawable balance')) {
            showAlert(`Insufficient withdrawable balance. Available: ${error.available?.toFixed(2) || 0} USDT`, 'warning');
        } else {
            showAlert(error.message || 'Withdrawal failed.', 'danger');
        }
    } finally {
        hideLoading();
    }
}

// Investment plan functions
function upgradePlan() {
    showSection('plans');
}

// Profile functions
async function handleProfileUpdate(e) {
    e.preventDefault();
    const name = document.getElementById('profileName').value.trim();
    const country = document.getElementById('profileCountry').value;
    const phone = document.getElementById('profilePhone').value.trim();
    
    // Validation
    if (!name) {
        showAlert('Please enter your name', 'warning');
        return;
    }

    if (!validateName(name)) {
        showAlert('Name must be at least 2 characters and contain only letters', 'warning');
        return;
    }

    if (!country) {
        showAlert('Please select your country', 'warning');
        return;
    }
    
    try {
        showLoading();
        
        await apiCall('/profile', {
            method: 'PUT',
            body: JSON.stringify({ name, country, phone })
        });
        
        // Update current user
        currentUser.name = name;
        currentUser.country = country;
        
        showAlert('Profile updated successfully!', 'success');
        
    } catch (error) {
        showAlert(error.message || 'Profile update failed.', 'danger');
    } finally {
        hideLoading();
    }
}

function changePassword() {
    showAlert('Password change feature would be implemented here', 'info');
}

function enable2FA() {
    showAlert('2FA feature would be implemented here', 'info');
}

function logout() {
    // Clear token
    removeToken();
    
    // Clear user data
    currentUser = null;
    userData = {
        walletBalance: 0,
        dailyEarnings: 0,
        totalEarnings: 0,
        withdrawable: 0,
        currentPlan: null,
        transactions: [],
        referrals: [],
        affiliateCode: '',
        commissionEarned: 0
    };
    
    // Redirect to home
    window.location.href = '/';
}

// Utility functions
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.select();
        element.setSelectionRange(0, 99999);
        document.execCommand('copy');
        showAlert('Copied to clipboard!', 'success');
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
    }
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-overlay';
    loadingDiv.innerHTML = `
        <div class="spinner"></div>
        <p>Processing...</p>
    `;
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.querySelector('.loading-overlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

function getTransactionBadgeColor(type) {
    switch (type) {
        case 'Deposit': return 'success';
        case 'Withdrawal': return 'warning';
        case 'Earnings': return 'info';
        case 'Investment': return 'primary';
        case 'Commission': return 'secondary';
        default: return 'secondary';
    }
}

function getStatusBadgeColor(status) {
    switch (status) {
        case 'Completed': return 'success';
        case 'Pending': return 'warning';
        case 'Failed': return 'danger';
        default: return 'secondary';
    }
}

// Wallet addresses
const walletAddresses = {
    USDT: 'TFbtd7LiS7T746ztRiseLGMuWKFpSUuNZt',
    TRON: 'TFbtd7LiS7T746ztRiseLGMuWKFpSUuNZt',
    BTC: 'bc1q8848vzdap2fuezexlyfrp5s3lwr5dxjmmkun4d'
};

// Add CSS for loading overlay
const style = document.createElement('style');
style.textContent = `
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        color: white;
    }
    
    .section {
        display: none;
    }
    
    .section.active {
        display: block;
    }
`;
document.head.appendChild(style); 