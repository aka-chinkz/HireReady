# Setup Custom Domain on Vercel

## Why Use a Custom Domain?

✅ **One stable URL** - Never changes  
✅ **Professional look** - Your own domain name  
✅ **Easier OAuth setup** - Only one URL to add to Google Cloud Console  
✅ **No more origin mismatch** - No need to add multiple Vercel URLs  

---

## Step 1: Get a Domain (If You Don't Have One)

### Option A: Buy a Domain
Popular domain registrars:
- **Namecheap**: https://www.namecheap.com (affordable)
- **Google Domains**: https://domains.google.com
- **GoDaddy**: https://www.godaddy.com
- **Cloudflare**: https://www.cloudflare.com/products/registrar/ (good pricing)

**Domain suggestions:**
- `hireready.com`
- `hire-ready.com`
- `hire-ready.app`
- `hireready.xyz`

**Cost:** Usually $10-15/year for a `.com` domain

### Option B: Use a Free Domain
Some services offer free subdomains, but they're usually less professional.

---

## Step 2: Add Custom Domain to Vercel

### Step 1: Go to Vercel Project Settings

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Click on your **"HireReady"** project
3. Go to **"Settings"** tab
4. Click **"Domains"** in the left sidebar

### Step 2: Add Your Domain

1. In the **"Domains"** section, you'll see a field to add a domain
2. Enter your domain (e.g., `hireready.com` or `www.hireready.com`)
3. Click **"Add"** or **"Continue"**

### Step 3: Configure DNS Records

Vercel will show you **DNS records** you need to add. Usually:

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

### Step 4: Add DNS Records to Your Domain Provider

1. Go to your domain provider's dashboard (Namecheap, Google Domains, etc.)
2. Find **"DNS Management"** or **"DNS Settings"**
3. Add the DNS records that Vercel provided:
   - Add the **A record** for root domain
   - Add the **CNAME record** for www subdomain
4. **Save** the DNS records

### Step 5: Wait for DNS Propagation

- **Usually takes:** 5 minutes to 24 hours
- **Average time:** 1-2 hours
- Vercel will show the status as "Validating..." then "Valid"

---

## Step 3: Update Google Cloud Console

Once your custom domain is active on Vercel:

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Go to **"APIs & Services"** → **"Credentials"**
3. Edit your OAuth Client ID
4. In **"Authorized JavaScript origins"**:
   - **Remove** all the different Vercel URLs (optional - you can keep them too)
   - **Add** your custom domain:
     ```
     https://hireready.com
     ```
   - If you also want www:
     ```
     https://www.hireready.com
     ```
5. **Save** changes

**Now you only need ONE URL in Google Cloud Console!** 🎉

---

## Step 4: Update Railway ALLOWED_ORIGINS (Optional)

If you want, you can also update Railway's `ALLOWED_ORIGINS` to include your custom domain:

1. Go to **Railway Dashboard**
2. Go to your backend service → **"Variables"** tab
3. Edit `ALLOWED_ORIGINS`:
   ```
   http://localhost:3000,https://hireready.com
   ```
4. Save

---

## Quick Setup Guide

### If You Have a Domain:

1. ✅ **Vercel:** Settings → Domains → Add your domain
2. ✅ **DNS Provider:** Add DNS records (A and CNAME)
3. ✅ **Wait:** 1-2 hours for DNS propagation
4. ✅ **Google Cloud Console:** Add your custom domain to authorized origins
5. ✅ **Done!** Test Google Login

### If You Need to Buy a Domain:

1. ✅ **Buy domain** from Namecheap/Google Domains (about $10-15/year)
2. ✅ **Follow steps above**

---

## Example: Complete Setup

**Domain:** `hireready.com`

**Vercel:**
- Root: `hireready.com` → Vercel
- WWW: `www.hireready.com` → Vercel

**Google Cloud Console:**
- Authorized JavaScript origins:
  ```
  http://localhost:3000
  https://hireready.com
  https://www.hireready.com
  ```

**Railway:**
- `ALLOWED_ORIGINS`: `http://localhost:3000,https://hireready.com`

---

## Benefits

✅ **One stable URL** - Never changes  
✅ **Professional** - Your own domain name  
✅ **Simple OAuth** - Only one URL to manage  
✅ **Future-proof** - Works with all deployments  
✅ **SEO friendly** - Custom domain helps with search rankings  

---

## Troubleshooting

### DNS Not Working?

1. **Check DNS records are correct** - Verify with your domain provider
2. **Wait longer** - Can take up to 24 hours (usually 1-2 hours)
3. **Check Vercel status** - Vercel will show "Validating..." then "Valid"
4. **Use DNS checker** - Check at https://dnschecker.org

### Domain Not Loading?

1. **Wait for DNS propagation** - It takes time
2. **Clear browser cache** - Hard refresh (Ctrl+F5)
3. **Check Vercel logs** - Look for deployment issues
4. **Verify DNS records** - Make sure they're correct

---

## Cost Estimate

- **Domain:** $10-15/year (`.com`)
- **Vercel:** Free (custom domains included on free tier)
- **Total:** About $1-1.25/month

---

## Summary

**Yes, you can and should use a custom domain!** It will solve your origin mismatch issues permanently by giving you one stable URL that never changes.

1. **Buy/use a domain** (if you don't have one)
2. **Add it to Vercel** (Settings → Domains)
3. **Configure DNS** (add A and CNAME records)
4. **Wait for propagation** (1-2 hours)
5. **Update Google Cloud Console** (add your custom domain)
6. **Done!** 🎉
