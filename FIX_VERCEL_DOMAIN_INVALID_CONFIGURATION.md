# Fix Vercel Domain "Invalid Configuration"

## The Problem

Your domains `hireready.com` and `www.hireready.com` show **"Invalid Configuration"** in Vercel.

This means:
- ✅ Domains are added to Vercel
- ❌ DNS records are not configured at your domain provider yet

## Solution: Add DNS Records to Your Domain Provider

### Step 1: Get DNS Records from Vercel

1. In Vercel, click **"Learn more"** next to the "Invalid Configuration" message
2. OR click **"Edit"** on one of the domains
3. Vercel will show you the **DNS records** you need to add

Usually you'll see something like:

#### For Root Domain (hireready.com):
```
Type: A
Name: @
Value: 76.76.21.21
```

#### For WWW Subdomain (www.hireready.com):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Note:** The exact values might be different - use what Vercel shows you!

### Step 2: Find Your Domain Provider

Where did you buy/register `hireready.com`?
- Namecheap
- Google Domains
- GoDaddy
- Cloudflare
- Other

### Step 3: Add DNS Records at Your Domain Provider

1. **Log into your domain provider's dashboard**
2. **Find DNS Management:**
   - Namecheap: Advanced DNS
   - Google Domains: DNS
   - GoDaddy: DNS Management
   - Cloudflare: DNS Settings

3. **Add the A record for root domain:**
   - Type: `A`
   - Name/Host: `@` (or leave blank, or `hireready.com`)
   - Value/Target: The IP address Vercel provided (e.g., `76.76.21.21`)
   - TTL: `3600` or `Automatic`

4. **Add the CNAME record for www:**
   - Type: `CNAME`
   - Name/Host: `www`
   - Value/Target: The CNAME value Vercel provided (e.g., `cname.vercel-dns.com`)
   - TTL: `3600` or `Automatic`

5. **Save/Apply the changes**

### Step 4: Wait for DNS Propagation

After adding DNS records:
- **Status will change:** "Invalid Configuration" → "Validating..." → "Valid"
- **Time:** Usually 5 minutes to 2 hours (can take up to 24 hours)
- **Check status:** Click "Refresh" button in Vercel

### Step 5: Verify DNS is Working

You can check if DNS is propagating:
1. Go to: https://dnschecker.org
2. Enter `hireready.com`
3. Select "A" record type
4. Check if it shows the Vercel IP address

## Quick Steps Summary

1. ✅ **Vercel:** Click "Learn more" or "Edit" to see DNS records
2. ✅ **Domain Provider:** Log into your domain provider dashboard
3. ✅ **Add DNS:** Add A record for `hireready.com` and CNAME for `www.hireready.com`
4. ✅ **Save:** Save changes at domain provider
5. ✅ **Wait:** Wait 1-2 hours for DNS propagation
6. ✅ **Refresh:** Click "Refresh" in Vercel to check status
7. ✅ **Done:** When status shows "Valid", your domain is ready!

## After DNS is Configured

Once both domains show "Valid" status in Vercel:

1. **Test your domain:**
   - Visit: `https://hireready.com`
   - Should load your Vercel app!

2. **Update Google Cloud Console:**
   - Add to "Authorized JavaScript origins":
     ```
     https://hireready.com
     https://www.hireready.com
     ```

3. **Update Railway (optional):**
   - Update `ALLOWED_ORIGINS` to include your custom domain

## Troubleshooting

### Still Showing "Invalid Configuration" After Adding DNS?

1. **Wait longer** - DNS can take up to 24 hours (usually 1-2 hours)
2. **Check DNS records are correct** - Double-check values match Vercel exactly
3. **Remove old DNS records** - Make sure no conflicting records exist
4. **Click "Refresh" in Vercel** - Sometimes needs manual refresh
5. **Check DNS at dnschecker.org** - Verify DNS is propagating worldwide

### Can't Find DNS Management?

If you can't find DNS settings:
1. **Check your domain provider's help docs**
2. **Look for:** "DNS", "DNS Management", "DNS Settings", "Name Servers"
3. **Contact support** - Your domain provider can help you add DNS records

### Domain Provider Not Working?

If you're having trouble with your current provider:
- You can transfer your domain to a different provider
- Or use Vercel's DNS (if your provider supports it)

## Common Domain Providers Setup

### Namecheap:
1. Log in → Domain List → Manage (next to domain)
2. Advanced DNS tab
3. Add records → Save

### Google Domains:
1. Log in → My domains → DNS
2. Custom resource records
3. Add A and CNAME records → Save

### GoDaddy:
1. Log in → My Products → DNS
2. Add records → Save

### Cloudflare:
1. Log in → Select domain → DNS
2. Add records → Save

## Next Steps

Once your domains show "Valid" status:
1. ✅ Visit `https://hireready.com` - Should work!
2. ✅ Update Google Cloud Console with custom domain
3. ✅ Test Google Login - Should work with custom domain!
4. ✅ No more origin mismatch errors! 🎉
