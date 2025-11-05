# 🚀 Pushing Code to GitHub - Step by Step

## Step 1: Create GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon in top right → **"New repository"**
3. Repository name: `gold-wallet` (or any name you prefer)
4. Description: "Gold Wallet - Digital Gold Trading Platform"
5. Choose: **Public** or **Private** (your choice)
6. **DO NOT** initialize with README, .gitignore, or license (we already have files)
7. Click **"Create repository"**

## Step 2: Copy Your Repository URL

After creating the repo, GitHub will show you commands. You'll need the repository URL:
- It will look like: `https://github.com/YOUR_USERNAME/gold-wallet.git`
- Or: `git@github.com:YOUR_USERNAME/gold-wallet.git`

**Copy this URL** - you'll need it in Step 3.

## Step 3: Push Your Code

Run these commands in your terminal (from the project root):

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Gold Wallet MVP with authentication, M-Pesa integration, and admin dashboard"

# Add remote repository (replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/gold-wallet.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Verify

1. Go back to your GitHub repository page
2. You should see all your files there
3. ✅ Ready for deployment!

---

## Troubleshooting

### If you get "authentication failed":
- You may need to authenticate with GitHub
- Use GitHub CLI: `gh auth login`
- Or use a Personal Access Token

### If you get "remote origin already exists":
- Remove it first: `git remote remove origin`
- Then add again: `git remote add origin YOUR_URL`

---

**Once code is pushed, we can proceed with deployment to Render and Vercel!** 🎉

