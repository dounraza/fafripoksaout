// src/services/afripoksBridge.js

export async function syncSession() {
  console.log('Afripoks Bridge: Syncing session...');
  try {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      console.log('Afripoks Bridge: No access token found.');
      return;
    }

    const r = await fetch('http://localhost:5000/auth/me', {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    console.log('Afripoks Bridge: Sync response status:', r.status);
    if (r.ok) {
      const data = await r.json();
      console.log('Afripoks Bridge: Sync data:', data);
      if (data.success && data.user) {
        localStorage.setItem('afripoks.user', JSON.stringify(data.user));
        localStorage.setItem('afripoks.bankroll', String(data.user.solde || data.user.chips || 0));
      }
    }
  } catch (e) {
    console.error('Failed to sync session:', e);
  }
}

export function saveUser(u) {
  console.log('Afripoks Bridge: Saving user:', u);
  try {
    localStorage.setItem("afripoks.user", JSON.stringify(u));
  } catch (e) {
    console.error('Failed to save user:', e);
  }
}

export function readForm(form) {
  const fd = new FormData(form);
  const get = (...keys) => {
    for (const k of keys) {
      const v = fd.get(k);
      if (v) return String(v).trim();
    }
    const el = form.querySelector("input[type=email], input[name*=mail], input[name*=pseudo], input[name*=user]");
    return el ? el.value.trim() : "";
  };
  const ident = get("pseudo", "username", "name", "email", "ident", "login");
  const email = get("email", "mail");
  return { name: (ident || email || "Joueur").split("@")[0], email: email || ident };
}

export function initAuthFormTracking() {
  console.log('Afripoks Bridge: Initializing form tracking...');
  document.addEventListener("submit", function (e) {
    console.log('Afripoks Bridge: Form submitted', e.target);
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (!/login|register|signup/i.test(window.location.pathname + (form.action || "") + (form.id || ""))) {
      if (!form.querySelector("input[type=password]")) return;
    }
    const user = readForm(form);
    saveUser(user);
  }, true);
}
