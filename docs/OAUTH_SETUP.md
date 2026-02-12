# OAuth Setup Guide
**Google Sign-In & Apple Sign-In Configuration**

## Status: ⚠️ Ready for Configuration

OAuth implementation is **complete and ready to use** once you configure the credentials. The code is fully functional but requires external service setup.

---

## Quick Start

### 1. Install Frontend Packages

```bash
cd mobile
npm install expo-auth-session expo-web-browser expo-apple-authentication @react-native-google-signin/google-signin
```

### 2. Backend Environment Variables

Add to `parkingpal-backend/.env`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com

# Apple OAuth
APPLE_CLIENT_ID=com.parkingpal.app.signin
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY_PATH=./certs/AuthKey_XXXXXXXXXX.p8
```

### 3. Test Availability

```bash
curl http://localhost:5000/api/auth/oauth/availability
```

Should return:
```json
{
  "success": true,
  "data": {
    "google": { "provider": "google", "enabled": false },
    "apple": { "provider": "apple", "enabled": false }
  }
}
```

---

## Google Sign-In Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "ParkingPal"
3. Enable **Google+ API**

### Step 2: Create OAuth Credentials

1. Navigate to: **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**

#### For Android:
- Application type: **Android**
- Package name: `com.parkingpal.app`
- SHA-1: Run `cd android && ./gradlew signingReport`
- Copy SHA-1 fingerprint

#### For iOS:
- Application type: **iOS**
- Bundle ID: `com.parkingpal.app`

#### For Web (Expo):
- Application type: **Web application**
- Authorized redirect URIs:
  ```
  https://auth.expo.io/@your-expo-username/parkingpal
  ```

### Step 3: Configure

1. Copy **Client ID** to `.env`:
   ```bash
   GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
   ```

2. For iOS, also add:
   ```bash
   GOOGLE_IOS_CLIENT_ID=123456789-ios.apps.googleusercontent.com
   ```

3. Download **client_secret** JSON (for backend verification)
   - Copy `client_secret` value to:
   ```bash
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
   ```

### Step 4: Update app.json

```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist",
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": [
              "com.googleusercontent.apps.123456789-abc"
            ]
          }
        ]
      }
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

---

## Apple Sign-In Setup

### Prerequisites
- **Apple Developer Account** ($99/year)
- Enrolled in Apple Developer Program

### Step 1: Register App ID

1. Go to [Apple Developer](https://developer.apple.com/account/resources/identifiers/list)
2. Click **+** to register new App ID
3. Select **App IDs**
4. Description: "ParkingPal"
5. Bundle ID: `com.parkingpal.app`
6. Capabilities: Enable **Sign in with Apple**
7. Click **Continue** and **Register**

### Step 2: Create Service ID

1. Click **+** to register new identifier
2. Select **Services IDs**
3. Description: "ParkingPal Sign In"
4. Identifier: `com.parkingpal.app.signin`
5. Enable **Sign in with Apple**
6. Click **Configure**:
   - Primary App ID: `com.parkingpal.app`
   - Domains: `your-backend-domain.com`
   - Return URLs: `https://your-backend.com/api/auth/apple/callback`
7. Click **Save**, then **Continue**, then **Register**

### Step 3: Create Key for Backend Verification

1. Go to **Keys**
2. Click **+** to create new key
3. Key Name: "ParkingPal Apple Sign In"
4. Enable **Sign in with Apple**
5. Click **Configure**:
   - Primary App ID: `com.parkingpal.app`
6. Click **Save**, **Continue**, **Register**
7. **Download** the `.p8` file (you can only download once!)
8. Note the **Key ID**

### Step 4: Configure Backend

1. Save `.p8` file to `parkingpal-backend/certs/AuthKey_XXXXXXXXXX.p8`

2. Add to `.env`:
   ```bash
   APPLE_CLIENT_ID=com.parkingpal.app.signin
   APPLE_TEAM_ID=ABC123XYZ  # Find in Apple Developer > Membership
   APPLE_KEY_ID=XXXXXXXXXX   # From Key creation step
   APPLE_PRIVATE_KEY_PATH=./certs/AuthKey_XXXXXXXXXX.p8
   ```

### Step 5: Update app.json

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.parkingpal.app",
      "infoPlist": {
        "CFBundleAllowMixedLocalizations": true
      },
      "entitlements": {
        "com.apple.developer.applesignin": ["Default"]
      }
    }
  }
}
```

---

## Testing OAuth

### Test Google Sign-In

```bash
# 1. Start backend
cd parkingpal-backend
npm run dev

# 2. Start mobile app
cd mobile
npm start

# 3. Try logging in with Google
# - Tap "Sign in with Google" button
# - Select Google account
# - App should redirect back with user data
```

### Test Apple Sign-In

**Note:** Apple Sign-In requires:
- Physical iOS device (doesn't work on simulator)
- App built with proper provisioning profile

```bash
# 1. Build for iOS device
cd mobile
eas build --profile development --platform ios

# 2. Install on device
# 3. Try logging in with Apple
```

---

## API Endpoints

### Check Availability
```http
GET /api/auth/oauth/availability
```

Response:
```json
{
  "success": true,
  "data": {
    "google": {
      "provider": "google",
      "enabled": true,
      "clientId": "123456789-abc.apps.googleusercontent.com"
    },
    "apple": {
      "provider": "apple",
      "enabled": true,
      "clientId": "com.parkingpal.app.signin"
    }
  }
}
```

### Sign In with OAuth
```http
POST /api/auth/oauth/signin
Content-Type: application/json

{
  "provider": "google",  // or "apple"
  "idToken": "eyJhbGc...",
  "userInfo": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "userType": "RENTER",
      "verified": {
        "email": true,
        "phone": false,
        "id": false
      }
    },
    "isNewUser": true
  }
}
```

---

## Troubleshooting

### Google Sign-In Issues

**"Developer Error" on Android**
- Verify SHA-1 fingerprint matches
- Check package name is `com.parkingpal.app`
- Ensure OAuth consent screen is configured

**"The app is not authorized" on iOS**
- Verify Bundle ID matches
- Check iOS Client ID is correct
- Ensure GoogleService-Info.plist is added

### Apple Sign-In Issues

**"Invalid client" error**
- Verify Service ID is `com.parkingpal.app.signin`
- Check domains and return URLs are configured
- Ensure App ID has Sign in with Apple enabled

**"Invalid_grant" error**
- Check `.p8` key file path is correct
- Verify Team ID and Key ID match
- Ensure key hasn't been revoked

### Backend Verification Fails

**Google token verification fails**
- Ensure `google-auth-library` is installed
- Check `GOOGLE_CLIENT_ID` matches the client ID that issued the token
- Verify token hasn't expired

**Apple token verification fails**
- Ensure `apple-signin-auth` is installed
- Check all Apple credentials are correct
- Verify `.p8` file is readable

---

## Security Notes

1. **Never commit credentials** - Use `.env` files
2. **Rotate keys** regularly
3. **Use HTTPS** in production
4. **Validate tokens** on backend (already implemented)
5. **Handle expired tokens** gracefully
6. **Log OAuth failures** for monitoring

---

## What's Already Implemented ✅

### Backend
- ✅ OAuth service with Google & Apple verification
- ✅ `/api/auth/oauth/availability` endpoint
- ✅ `/api/auth/oauth/signin` endpoint
- ✅ Token verification (lazy-loaded libraries)
- ✅ User creation/linking logic
- ✅ JWT token generation
- ✅ Email auto-verification for OAuth users

### Frontend
- ✅ OAuth API client methods
- ✅ AuthContext with OAuth methods
- ✅ Login screen with OAuth buttons
- ⚠️ **Needs:** Package installation & configuration

---

## Next Steps

1. **Get credentials** from Google Cloud Console & Apple Developer
2. **Install frontend packages**: `npm install` (see Quick Start)
3. **Configure `.env`** with your credentials
4. **Test** on both platforms
5. **Deploy** with proper SSL certificates

---

**Need Help?**
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Docs](https://developer.apple.com/sign-in-with-apple/)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)

**Status:** ✅ Ready to configure
**Estimated Setup Time:** 2-3 hours
**Cost:** $0 (Google) + $99/year (Apple Developer Account)
