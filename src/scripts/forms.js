// Shared form handler. Two modes, picked by data-mode on the <form>:
//
//   data-mode="shopify"  Newsletter. Creates a marketing-opted-in customer in
//                        the store via the Storefront API (customerCreate).
//                        Needs data-shop, data-api and data-token.
//   data-mode="mailto"   Contact and wholesale. Composes an email in the
//                        visitor's mail app with every field filled in.
//                        Needs data-mailto and data-subject.
//
// Both surface a real success/failure line via [data-form-status];
// nothing fails silently.

const LABELS = {
  name: 'Name',
  email: 'Email',
  message: 'Message',
  business_name: 'Business name',
  contact_name: 'Contact name',
  location: 'Location',
  monthly_volume: 'Monthly volume',
};

export function initAjaxForm(formId, successMessage) {
  const form = document.getElementById(formId);
  if (!form || form.dataset.bound) return;
  form.dataset.bound = 'true';

  const status = form.querySelector('[data-form-status]');
  const button = form.querySelector('button[type="submit"]');

  const setStatus = (msg, ok) => {
    if (!status) return;
    status.textContent = msg;
    status.classList.toggle('hidden', !msg);
    status.style.color = ok ? 'var(--success)' : 'var(--warning)';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (form.dataset.mode === 'mailto') {
      submitMailto(form, setStatus);
      return;
    }

    const originalLabel = button ? button.textContent : '';
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending…';
    }
    setStatus('', true);

    try {
      const result = await subscribe(form);
      if (result.ok) {
        form.reset();
        setStatus(result.already ? 'You’re already on the list.' : successMessage, true);
      } else {
        setStatus(result.message, false);
      }
    } catch {
      setStatus('Network error. Please check your connection and try again.', false);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    }
  });
}

function submitMailto(form, setStatus) {
  const to = form.dataset.mailto;
  const subject = form.dataset.subject || 'Website message';
  const lines = [];
  for (const [key, value] of new FormData(form).entries()) {
    const text = String(value).trim();
    if (!text) continue;
    if (key === 'message') {
      lines.push('', text);
    } else {
      lines.push(`${LABELS[key] || key}: ${text}`);
    }
  }
  const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  window.location.href = href;
  setStatus(`Your email app should open with the message filled in. If it doesn’t, email us at ${to}.`, true);
}

async function subscribe(form) {
  const { shop, api, token } = form.dataset;
  const email = (new FormData(form).get('email') || '').toString().trim();
  if (!shop || !api || !token) {
    return { ok: false, message: 'Signup is not configured yet. Please try again later.' };
  }

  // Storefront customerCreate requires a password. The visitor never uses
  // it; they only get marketing email. Random per signup.
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const password = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

  const query = `mutation Subscribe($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id }
      customerUserErrors { code field message }
    }
  }`;

  const res = await fetch(`https://${shop}/api/${api}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({
      query,
      variables: { input: { email, password, acceptsMarketing: true } },
    }),
  });

  if (!res.ok) {
    return { ok: false, message: 'Something went wrong signing you up. Please try again.' };
  }

  const data = await res.json();
  const payload = data?.data?.customerCreate;
  const errors = payload?.customerUserErrors || [];
  if (payload?.customer) return { ok: true };
  if (errors.some((x) => x.code === 'TAKEN')) return { ok: true, already: true };
  const message = errors.map((x) => x.message).join(' ') || 'Something went wrong signing you up. Please try again.';
  return { ok: false, message };
}
