/* ═══════════════════════════════════════════════════════════════
   Emmerican Adventure — Adventures Page JS
   Supabase read · filter · render
   ═══════════════════════════════════════════════════════════════ */

const SUPABASE_URL  = 'https://azjwuraxixuioeddkicq.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6and1cmF4aXh1aW9lZGRraWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MTM4MTMsImV4cCI6MjA5Njk4OTgxM30._GuEJWGiRHktIeX6ukleM2s07V_W6pbMxIV8ntXjy44';

const $ = id => document.getElementById(id);

let allAdventures = [];
let activeType    = 'all';
let lightboxPhotos = [];
let lightboxIndex  = 0;

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  bindFilters();
  bindSearch();
  bindLightbox();
  await loadAdventures();
});

// ── Supabase fetch ────────────────────────────────────────────────
async function loadAdventures() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/adventures?select=*&status=eq.visited&order=visited_date.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`,
        }
      }
    );

    if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
    allAdventures = await res.json();
    renderAll();
  } catch (err) {
    console.error('Failed to load adventures:', err);
    $('advLoading').innerHTML = '<p style="color:var(--red)">Failed to load adventures. Please refresh.</p>';
  }
}

// ── Filters ───────────────────────────────────────────────────────
function bindFilters() {
  document.querySelectorAll('.adv-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.adv-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeType = pill.dataset.type;
      renderAll();
    });
  });
}

function bindSearch() {
  const search = $('advSearch');
  if (!search) return;
  let debounce;
  search.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(renderAll, 200);
  });
}

// ── Render ────────────────────────────────────────────────────────
function renderAll() {
  const query = ($('advSearch')?.value || '').toLowerCase().trim();

  // Filter
  let filtered = allAdventures.filter(a => {
    if (activeType !== 'all' && a.type !== activeType) return false;
    if (query) {
      const haystack = [a.name, a.location_city, a.location_country, a.cuisine, a.notes, ...(a.tags || [])]
        .filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  // Update stats (always from full set, not filtered)
  updateStats(allAdventures);

  // Hide loading
  $('advLoading').classList.add('hidden');

  if (filtered.length === 0) {
    $('advEmpty').classList.remove('hidden');
    $('advGrid').innerHTML = '';
    return;
  }

  $('advEmpty').classList.add('hidden');

  // Group by country → city
  const groups = groupAdventures(filtered);
  $('advGrid').innerHTML = groups.map(renderGroup).join('');

  // Bind photo clicks after render
  bindPhotoClicks();
}

function updateStats(data) {
  $('statRestaurants').textContent = data.filter(a => a.type === 'restaurant').length;
  $('statPlaces').textContent       = data.filter(a => a.type === 'place').length;
  $('statCountries').textContent    = data.filter(a => a.type === 'country').length;
}

function groupAdventures(data) {
  // Group by location_country → location_city
  const map = new Map();

  data.forEach(a => {
    const country = a.location_country || 'Unknown';
    const city    = a.location_city    || '';
    const key     = city ? `${country}||${city}` : country;

    if (!map.has(key)) {
      map.set(key, { country, city, items: [] });
    }
    map.get(key).items.push(a);
  });

  // Sort groups: US first, then chronologically by newest entry
  return Array.from(map.values()).sort((a, b) => {
    // US entries first
    const aUs = a.country === 'United States' ? 0 : 1;
    const bUs = b.country === 'United States' ? 0 : 1;
    if (aUs !== bUs) return aUs - bUs;
    return a.country.localeCompare(b.country) || a.city.localeCompare(b.city);
  });
}

function renderGroup(group) {
  const label = group.city ? `${group.city}, ${group.country}` : group.country;
  const count = group.items.length;
  return `
    <div class="adv-group">
      <div class="adv-group-header">
        <h2 class="adv-group-label">${escHtml(label)}</h2>
        <span class="adv-group-count">${count} entr${count === 1 ? 'y' : 'ies'}</span>
      </div>
      <div class="adv-cards">
        ${group.items.map(renderCard).join('')}
      </div>
    </div>
  `;
}

function renderCard(a) {
  const typeEmoji = { restaurant: '🍜', place: '📍', country: '🌏' }[a.type] || '';
  const photos = a.photos || [];
  const coverPhoto = photos[0] || null;

  // Photo area
  let photoHtml;
  if (coverPhoto) {
    const photoData = JSON.stringify(photos).replace(/"/g, '&quot;');
    photoHtml = `
      <div class="adv-card-photo" data-photos="${photoData}" data-index="0">
        <img src="${escHtml(coverPhoto)}" alt="${escHtml(a.name)}" loading="lazy" />
        <span class="adv-type-badge ${a.type}">${escHtml(a.type)}</span>
        ${photos.length > 1 ? `<span class="adv-photo-count">+${photos.length - 1} photos</span>` : ''}
      </div>`;
  } else {
    photoHtml = `
      <div class="adv-card-no-photo">
        ${typeEmoji}
        <span class="adv-type-badge ${a.type}">${escHtml(a.type)}</span>
      </div>`;
  }

  // Stars
  let starsHtml = '';
  if (a.rating) {
    starsHtml = `<div class="adv-stars" aria-label="${a.rating} out of 5 stars">
      ${[1,2,3,4,5].map(i => `<span class="adv-star ${i <= a.rating ? 'filled' : ''}">★</span>`).join('')}
    </div>`;
  }

  // Date
  const dateStr = a.visited_date
    ? new Date(a.visited_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  // Tags
  const tagsHtml = (a.tags || []).length
    ? `<div class="adv-card-tags">${a.tags.map(t => `<span class="adv-tag">${escHtml(t)}</span>`).join('')}</div>`
    : '';

  // Notes
  const notesHtml = a.notes
    ? `<p class="adv-card-notes">${escHtml(a.notes)}</p>`
    : '';

  // Family reactions
  let reactionsHtml = '';
  if (a.family_reactions && Object.keys(a.family_reactions).length) {
    const pairs = Object.entries(a.family_reactions);
    reactionsHtml = `<div class="adv-reactions">
      ${pairs.map(([name, rating]) => `
        <span class="adv-reaction">
          <span class="adv-reaction-name">${escHtml(name)}</span>
          <span>${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span>
        </span>`).join('')}
    </div>`;
  }

  // Footer badges
  const badges = [];
  if (a.kid_friendly === true)  badges.push(`<span class="adv-badge kid-yes">👶 Kid-friendly</span>`);
  if (a.would_return === true)  badges.push(`<span class="adv-badge would-return">↩ Would return</span>`);
  const priceHtml = a.price_range ? `<span class="adv-price">${escHtml(a.price_range)}</span>` : '';
  const blogLinkHtml = a.post_url
    ? `<a href="${escHtml(a.post_url)}" class="adv-card-blog-link">Read post →</a>`
    : '';

  const hasFooter = badges.length || priceHtml || blogLinkHtml;
  const footerHtml = hasFooter ? `
    <div class="adv-card-footer">
      <div class="adv-badges">${badges.join('')}</div>
      ${priceHtml}
      ${blogLinkHtml}
    </div>` : '';

  // Location line
  const locParts = [a.location_city, a.location_country].filter(Boolean);
  const locHtml = locParts.length
    ? `<p class="adv-card-location">${escHtml(locParts.join(', '))}</p>`
    : '';

  // Cuisine
  const cuisineHtml = a.cuisine
    ? `<span class="adv-card-cuisine">${escHtml(a.cuisine)}</span>`
    : '';

  return `
    <article class="adv-card">
      ${photoHtml}
      <div class="adv-card-body">
        <div class="adv-card-meta">
          ${dateStr ? `<span class="adv-card-date">${dateStr}</span>` : ''}
          ${cuisineHtml}
        </div>
        <h3 class="adv-card-name">${escHtml(a.name)}</h3>
        ${locHtml}
        ${starsHtml}
        ${notesHtml}
        ${tagsHtml}
        ${reactionsHtml}
        ${footerHtml}
      </div>
    </article>`;
}

// ── Lightbox ──────────────────────────────────────────────────────
function bindPhotoClicks() {
  document.querySelectorAll('.adv-card-photo').forEach(el => {
    el.addEventListener('click', () => {
      const photos = JSON.parse(el.dataset.photos || '[]');
      const index  = parseInt(el.dataset.index || '0', 10);
      openLightbox(photos, index);
    });
  });
}

function bindLightbox() {
  $('advLightboxClose')?.addEventListener('click', closeLightbox);
  $('advLightboxPrev')?.addEventListener('click', () => shiftLightbox(-1));
  $('advLightboxNext')?.addEventListener('click', () => shiftLightbox(1));

  $('advLightbox')?.addEventListener('click', e => {
    if (e.target === $('advLightbox')) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if ($('advLightbox')?.classList.contains('hidden')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  shiftLightbox(-1);
    if (e.key === 'ArrowRight') shiftLightbox(1);
  });
}

function openLightbox(photos, index) {
  lightboxPhotos = photos;
  lightboxIndex  = index;
  updateLightboxImg();
  $('advLightbox').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  $('advLightbox').classList.add('hidden');
  document.body.style.overflow = '';
}

function shiftLightbox(dir) {
  lightboxIndex = (lightboxIndex + dir + lightboxPhotos.length) % lightboxPhotos.length;
  updateLightboxImg();
}

function updateLightboxImg() {
  const img = $('advLightboxImg');
  if (img) img.src = lightboxPhotos[lightboxIndex] || '';
  $('advLightboxPrev').style.display = lightboxPhotos.length > 1 ? '' : 'none';
  $('advLightboxNext').style.display = lightboxPhotos.length > 1 ? '' : 'none';
}

// ── Util ──────────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
