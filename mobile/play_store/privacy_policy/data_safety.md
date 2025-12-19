# Data Safety Questionnaire - USOD Security

Use this guide to complete the Data Safety section in Google Play Console.

---

## Section 1: Data Collection

### Does your app collect or share any user data?
**Answer: Yes**

---

## Section 2: Data Types Collected

### Personal Information

| Data Type | Collected | Purpose | Shared |
|-----------|-----------|---------|--------|
| Name | Yes | Account identification | No |
| Email | Yes | Account login, notifications | No |
| User ID | Yes | Account management | No |

### Credentials

| Data Type | Collected | Purpose | Shared |
|-----------|-----------|---------|--------|
| Passwords | Yes | Authentication (hashed) | No |

### Device or Other IDs

| Data Type | Collected | Purpose | Shared |
|-----------|-----------|---------|--------|
| Device ID | Yes | Security, session management | No |

### App Activity

| Data Type | Collected | Purpose | Shared |
|-----------|-----------|---------|--------|
| App interactions | Yes | Analytics, improvement | No |
| In-app search history | No | - | - |

### App Info and Performance

| Data Type | Collected | Purpose | Shared |
|-----------|-----------|---------|--------|
| Crash logs | Yes | Bug fixing | No |
| Diagnostics | Yes | Performance improvement | No |

---

## Section 3: Data Usage

### Security
- [x] Data is used for security purposes (threat detection, authentication)
- [x] Data is encrypted in transit
- [x] Data deletion is available on request

### Analytics
- [x] Usage data collected to improve app functionality
- [x] Not shared with third parties for advertising

### Account Management
- [x] Personal information used for account creation and management
- [x] Credentials stored securely (hashed)

---

## Section 4: Data Handling

### Is data encrypted in transit?
**Answer: Yes** - All API communications use HTTPS/TLS

### Can users request data deletion?
**Answer: Yes** - Users can request account and data deletion

### How long is data retained?
**Answer:** 
- Account data: While account is active
- Security logs: 90 days (configurable)
- Session data: Until logout

---

## Section 5: Answers for Play Console

Copy these answers when filling out the Data Safety form:

1. **Does your app collect user data?** → Yes
2. **Is all collected data encrypted in transit?** → Yes
3. **Do you provide a way for users to request deletion?** → Yes
4. **Does your app share data with third parties?** → No

### Data Types to Select:
- ✅ Personal info → Name, Email address, User IDs
- ✅ Authentication → Passwords (stored securely)  
- ✅ Device identifiers
- ✅ App interactions
- ✅ Crash logs, Diagnostics

### For Each Data Type, Select:
- **Purpose**: App functionality, Security, Analytics
- **Is data shared?**: No
- **Is data required?**: Yes (for core functionality)
- **Is data optional?**: No

---

## Quick Reference Card

| Question | Answer |
|----------|--------|
| Collects data? | Yes |
| Shares data? | No |
| Third-party advertising? | No |
| Encrypted in transit? | Yes |
| Deletion available? | Yes |
| Independent security verified? | No (optional) |
