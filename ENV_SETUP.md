# Environment Variables Setup

## Step 1: Create .env File

Create a file named `.env` in the root of your project:

```bash
# In your project root directory
touch .env
```

## Step 2: Add Paystack Keys

Add the following to your `.env` file:

```env
# Paystack API Keys
# Get your keys from https://dashboard.paystack.com/#/settings/developers

# For development/testing - use test keys
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx

# For production - use live keys (uncomment when ready)
# REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 3: Get Your Paystack Keys

1. Go to https://paystack.com/
2. Sign up or log in to your account
3. Navigate to **Settings** → **API Keys & Webhooks**
4. Copy your **Public Key** (starts with `pk_test_` for test mode)
5. Replace `pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx` in your `.env` file with your actual key

## Step 4: Secure Your .env File

Make sure `.env` is in your `.gitignore` file:

```bash
# Add this line to your .gitignore
.env
.env.local
.env.production
```

## Important Notes

⚠️ **Security Best Practices:**
- **NEVER** commit your `.env` file to version control
- **NEVER** expose your secret key in frontend code
- Use **test keys** during development
- Switch to **live keys** only when deploying to production
- Keep your secret key on the backend server only

## Testing Without Payment

If you want to test the registration flow without setting up Paystack immediately:

1. The form will still work
2. Payment popup won't open (because no valid key)
3. You can temporarily comment out the payment initialization in `Register.js`

## Test Cards (Paystack)

When testing with Paystack test keys, use these test cards:

**Successful Payment:**
- Card Number: `4084 0840 8408 4081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`
- OTP: `123456`

**Failed Payment (Insufficient Funds):**
- Card Number: `5060 6666 6666 6666`

## Restart Development Server

After adding environment variables, restart your development server:

```bash
# Stop the server (Ctrl+C)
# Start it again
npm start
```

## Verification

To verify your environment variables are loaded:

```javascript
// Add this temporarily to Register.js
console.log('Paystack Key:', process.env.REACT_APP_PAYSTACK_PUBLIC_KEY);
```

You should see your key in the browser console (remember to remove this after verification).

