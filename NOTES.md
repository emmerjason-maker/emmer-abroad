# Emmerican Adventure — Project Notes

> Running reference for architecture, decisions, credentials, and known issues.
> Update this file whenever something significant changes.

---

## 🌐 Site Info

| Item | Value |
|------|-------|
| Live URL | https://emmericanadventure.com |
| GitHub Repo | https://github.com/emmerjason-maker/emmerican-adventure |
| Hosting | GitHub Pages |
| Custom Domain | Porkbun (emmericanadventure.com) |
| Branch | `main` (branch protection enabled — force push allowed) |

---

## 🗂 File Structure

```
/
├── index.html          — Homepage
├── blog.html           — Journal index (post cards)
├── about.html          — About the Emmer family
├── photos.html         — Full photo gallery
├── search.html         — Client-side post search
├── 404.html            — Custom error page
├── sitemap.xml         — Submitted to Google Search Console
├── robots.txt          — (if exists)
├── style.css           — Global styles (NO :root block here)
├── darkmode.css        — ALL CSS variables + light/dark theme
├── darkmode.js         — Theme toggle logic
├── blog.css            — Blog/post-specific styles
├── main.js             — Scroll animations, lightbox, mobile menu, timeline
├── admin.html          — Admin panel UI
├── admin.js            — Admin panel logic (GitHub API commits)
├── admin.css           — Admin panel styles
├── posts/              — Individual post HTML files
└── images/             — All uploaded images
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Pure HTML/CSS/JS — no build step |
| Hosting | GitHub Pages |
| CMS | Custom admin panel (admin.html) — commits via GitHub API |
| DNS | Porkbun |
| Analytics | Google Analytics G-KRCW4S3G9P |
| Ads | Google AdSense ca-pub-3956728145959428 (awaiting approval) |
| Affiliate | Amazon Associates emmericanadve-20 |
| Comments | Disqus (shortname: emmericanadventure) |
| Newsletter | Mailchimp |
| Fonts | DM Serif Display, Noto Serif JP, Space Mono (Google Fonts) |

---

## 🔑 Admin Panel

- **URL:** https://emmericanadventure.com/admin.html
- **Password:** Stored as SHA-256 hash in admin.js (plain text: `japan2026`)
- **GitHub owner:** emmerjason-maker
- **GitHub repo:** emmerican-adventure
- **Branch:** main
- **PAT:** Regenerate at GitHub → Settings → Developer settings → Personal access tokens
  - ⚠️ Rotate PAT regularly — treat like a password

---

## 🎨 Branding

| Token | Value |
|-------|-------|
| `--ink` | `#1a1714` (dark) |
| `--paper` | `#f5f0e8` (light) |
| `--red` | `#c0392b` |
| `--gold` | `#b8922a` |
| Font Display | DM Serif Display |
| Font Body | Noto Serif JP |
| Font Mono | Space Mono |

**Key rule:** CSS variables live ONLY in `darkmode.css`. Never add `:root` blocks to `style.css`.

---

## ✍️ Publishing Posts

1. Go to https://emmericanadventure.com/admin.html
2. Password: `japan2026`
3. Fill in title, body, date, location, tag, SEO excerpt, optional YouTube ID
4. Upload images — first image auto-adds to homepage photo grid (max 6) and photos.html
5. Hit Publish — admin commits directly to GitHub
6. **After publishing:** run `git pull --rebase origin main` in VS Code to sync local

### Post numbering
- `countExistingPosts()` in admin.js counts `class="post-index-card"` in blog.html
- Was broken (counted wrong class) — fixed June 2026

### Related posts (search.html)
- When you publish a new post, add it to the `POSTS` array in `search.html` manually
- Also add it to the related posts arrays in each existing post file (or ask Claude)

---

## 📸 Photos

- Homepage grid shows **6 most recent** photos (auto-managed by admin on publish)
- Full gallery at photos.html (all photos, auto-managed)
- Images are optimized to ~200KB on upload via admin (max 1600px wide, JPEG 75%)
- **If adding photos manually:** add `photo-item` blocks in index.html and photos.html

---

## 🗺 Journey Map

- File: `images/jax-to-yokosuka-map.png`
- Clickable on homepage — opens in lightbox
- Original manga-style design — don't replace without approval

---

## 🔍 SEO

- Sitemap: https://emmericanadventure.com/sitemap.xml
- Google Search Console: verified ✅, sitemap submitted ✅
- All pages have: `meta description`, `og:title`, `og:description`, `og:image`, `canonical`
- og-image: `images/og-image.jpg` (1200×630)
- **Update sitemap** when adding new pages or posts

---

## 🐛 Known Issues / Open Items

- [ ] Charley's overseas vet screening still in progress (update about page when complete)
- [ ] AdSense awaiting approval — post-ad blocks collapse until approved
- [ ] Follow-seller push notifications untested end-to-end (Next Post PCS)
- [ ] Stripe customer portal untested (Next Post PCS)
- [ ] About page needs a family photo
- [ ] Version bump to v1.0 pending (Next Post PCS)
- [ ] Consider Pinterest business account for organic traffic
- [ ] Consider Instagram for short clips

---

## 📐 CSS Rules & Patterns

- **CSS variables** → `darkmode.css` only, never `style.css`
- **Centering sections** → `max-width` on inner elements, not the section itself
- **Dark video section** → hardcoded `#1a1714 !important` in `darkmode.css` for dark mode
- **Mobile menu** → toggled via JS in `main.js`, closes on tap outside or nav link click
- **Post-ad gap** → `.post-ad` uses `max-height: 0` until AdSense fills it (MutationObserver in main.js)
- **Inline style override** → use `useEffect` direct DOM manipulation or `!important`, not class overrides

---

## 🚀 Git Workflow

```bash
# After admin panel publishes (it commits directly to GitHub)
git pull --rebase origin main

# Normal local changes
git add .
git commit -m "your message"
git push origin main

# If push rejected
git pull --rebase origin main
git push origin main
```

---

## 📬 Integrations Setup

### Mailchimp Newsletter
- Connected via embed form in newsletter section
- Welcome email: set up via Automations → Classic Automations → Welcome new subscribers
- Double opt-in recommended

### Disqus Comments
- Shortname: `emmericanadventure`
- Loads on every post page

### Google Analytics
- ID: `G-KRCW4S3G9P`
- Vercel Analytics also enabled

### Amazon Associates
- Tag: `emmericanadve-20`
- Add affiliate links to posts naturally (packing gear, travel items, Japan guides)

---

*Last updated: June 2026*
