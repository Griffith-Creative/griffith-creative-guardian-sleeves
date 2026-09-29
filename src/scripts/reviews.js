// Reviews behavior on the PDP: refresh the baked reviews from Judge.me on each
// visit (so a new review shows without a redeploy) and drive "Show more".
// Any failed refresh is silent: the page keeps what was baked at build.
// The markup and the data-* hooks live in components/Reviews.astro,
// ReviewItem.astro and Stars.astro.
import {
  getReviews,
  getReviewPage,
  starFill,
  starsLabel,
  countLabel,
  barWidth,
  formatDate,
  splitEmails,
} from '../lib/reviews.js';

function setStars(root, rating) {
  if (!root) return;
  root.setAttribute('aria-label', starsLabel(rating));
  root.querySelectorAll('.gs-star-fill').forEach((fill, i) => {
    fill.style.width = `${starFill(rating, i + 1)}%`;
  });
}

function setText(el, value) {
  if (!el) return;
  el.textContent = value;
  el.hidden = !value;
}

// Builds one review from the <template>. Every value is written as text.
function buildItem(template, review) {
  const item = template.content.firstElementChild.cloneNode(true);
  item.dataset.review = review.id;
  item.classList.toggle('pb-10', !!review.reply);
  item.classList.toggle('pb-8', !review.reply);

  setStars(item.querySelector('[data-stars]'), review.rating);

  const date = item.querySelector('[data-review-date]');
  date.dateTime = review.date;
  date.textContent = formatDate(review.date);

  setText(item.querySelector('[data-review-title]'), review.title);
  const body = item.querySelector('[data-review-body]');
  setText(body, review.body);
  body.classList.toggle('mt-2', !!review.title);
  body.classList.toggle('mt-4', !review.title);

  const photos = item.querySelector('[data-review-photos]');
  photos.hidden = review.photos.length === 0;
  review.photos.forEach((photo, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = photo.full;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'gs-focus block w-[72px] h-[72px] bg-soft-cloud';
    const img = document.createElement('img');
    img.src = photo.thumb;
    img.alt = `Customer photo ${i + 1} from ${review.author}`;
    img.width = 72;
    img.height = 72;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.className = 'w-full h-full object-cover';
    const note = document.createElement('span');
    note.className = 'sr-only';
    note.textContent = '(opens in new tab)';
    a.append(img, note);
    li.append(a);
    photos.append(li);
  });

  item.querySelector('[data-review-author]').textContent = review.author;
  item.querySelector('[data-review-verified]').hidden = !review.verified;

  item.querySelector('[data-review-reply]').hidden = !review.reply;
  const replyBody = item.querySelector('[data-review-reply-body]');
  replyBody.textContent = '';
  for (const part of splitEmails(review.reply)) {
    if (!part.email) {
      replyBody.append(part.text);
      continue;
    }
    const a = document.createElement('a');
    a.href = `mailto:${part.text}`;
    a.className = 'gs-focus text-ink underline underline-offset-2 rounded-[4px]';
    a.textContent = part.text;
    replyBody.append(a);
  }
  return item;
}

function initReviews() {
  const section = document.querySelector('[data-reviews]');
  if (!section || section.dataset.bound) return;
  section.dataset.bound = 'true';

  const template = section.querySelector('[data-review-template]');
  const list = section.querySelector('[data-reviews-list]');
  const grid = section.querySelector('[data-reviews-grid]');
  const moreRow = section.querySelector('[data-reviews-more-row]');
  const more = section.querySelector('[data-reviews-more]');
  const moreLabel = section.querySelector('[data-reviews-more-label]');
  const spinner = section.querySelector('[data-reviews-more-spinner]');
  const shown = section.querySelector('[data-reviews-shown]');
  const status = section.querySelector('[data-reviews-status]');
  const ratingLine = document.querySelector('[data-rating-line]');

  // Starts from what was baked at build, in case the refresh never lands.
  let page = 1;
  let totalPages = Number(section.dataset.totalPages) || 0;
  let total = Number(section.dataset.total) || 0;

  const setStatus = (msg) => {
    status.textContent = msg;
    status.classList.toggle('hidden', !msg);
    status.style.color = 'var(--warning)';
  };

  const updateShown = () => {
    shown.textContent = `${list.children.length} of ${total}`;
    moreRow.hidden = page >= totalPages;
  };

  function render(data) {
    const has = data.count > 0;
    total = data.count;
    page = 1;
    totalPages = data.totalPages;

    section.querySelectorAll('[data-reviews-filled]').forEach((el) => (el.hidden = !has));
    section.querySelector('[data-reviews-empty]').hidden = has;
    grid.classList.toggle('gap-8', has);
    grid.classList.toggle('gap-5', !has);

    section.querySelector('[data-reviews-average]').textContent = data.average.toFixed(1);
    section.querySelector('[data-reviews-count]').textContent = countLabel(data.count);
    setStars(section.querySelector('[data-reviews-filled] [data-stars]'), data.average);
    for (const row of data.histogram) {
      const li = section.querySelector(`[data-reviews-bar="${row.star}"]`);
      if (!li) continue;
      li.querySelector('[data-reviews-bar-text]').textContent = `${row.star} stars: ${countLabel(row.count)}`;
      li.querySelector('[data-reviews-bar-value]').style.width = `${barWidth(row.count, data.histogram)}%`;
      li.querySelector('[data-reviews-bar-count]').textContent = String(row.count);
    }

    list.replaceChildren(...data.reviews.map((r) => buildItem(template, r)));
    updateShown();

    if (ratingLine) {
      ratingLine.hidden = !has;
      setStars(ratingLine.querySelector('[data-stars]'), data.average);
      ratingLine.querySelector('[data-rating-average]').textContent = data.average.toFixed(1);
      ratingLine.querySelector('[data-rating-count]').textContent = countLabel(data.count);
    }
  }

  getReviews().then((data) => {
    if (data) render(data);
  });

  more.addEventListener('click', async () => {
    if (more.disabled) return;
    more.disabled = true;
    more.setAttribute('aria-busy', 'true');
    moreLabel.hidden = true;
    spinner.hidden = false;
    setStatus('');

    const next = await getReviewPage(page + 1);

    more.disabled = false;
    more.removeAttribute('aria-busy');
    moreLabel.hidden = false;
    spinner.hidden = true;

    if (!next) {
      setStatus('Could not load more reviews. Please try again in a moment.');
      return;
    }
    const have = new Set([...list.children].map((li) => li.dataset.review));
    const fresh = next.reviews.filter((r) => !have.has(r.id));
    list.append(...fresh.map((r) => buildItem(template, r)));
    page = next.page;
    totalPages = next.totalPages;
    updateShown();
    // Keep keyboard users in place: move focus to the first review just added.
    const first = fresh.length ? list.querySelector(`[data-review="${CSS.escape(fresh[0].id)}"]`) : null;
    if (first) {
      first.tabIndex = -1;
      first.focus({ preventScroll: true });
    }
  });
}

initReviews();
document.addEventListener('astro:after-swap', initReviews);
