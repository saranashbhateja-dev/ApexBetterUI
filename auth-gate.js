/* Apex OS account gate. Authentication is handled by Supabase Auth. */
(() => {
  'use strict';
  const body = document.body;
  const screen = document.getElementById('auth-screen');
  const form = document.getElementById('auth-form');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const submit = document.getElementById('auth-submit');
  const message = document.getElementById('auth-message');
  const forgot = document.getElementById('auth-forgot');
  const offline = document.getElementById('auth-offline');
  const tabs = [...document.querySelectorAll('[data-auth-mode]')];
  const config = window.APEX_SUPABASE_CONFIG || {};
  let mode = 'signin';
  let client = null;
  let localMode = false;

  function showMessage(text, kind = '') {
    message.textContent = text;
    message.className = `auth-message visible${kind ? ` ${kind}` : ''}`;
  }
  function setMode(next) {
    mode = next;
    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.authMode === next));
    submit.innerHTML = next === 'signup' ? 'Create account <span>→</span>' : 'Sign in <span>→</span>';
    passwordInput.autocomplete = next === 'signup' ? 'new-password' : 'current-password';
    forgot.hidden = next === 'signup';
    message.className = 'auth-message';
  }
  function enterApp(user, isLocal = false) {
    localMode = isLocal;
    body.classList.remove('auth-required');
    screen.hidden = true;
    const email = user?.email || '';
    const label = document.getElementById('account-label');
    const emailLabel = document.getElementById('account-email-label');
    const avatar = document.getElementById('account-avatar');
    if (label) label.textContent = isLocal ? 'LOCAL WORKSPACE' : (email.split('@')[0] || 'APEX ACCOUNT').toUpperCase();
    if (emailLabel) emailLabel.textContent = isLocal ? 'This device only' : email;
    if (avatar) avatar.textContent = (email[0] || 'A').toUpperCase();
  }
  function leaveApp() {
    localMode = false;
    body.classList.add('auth-required');
    screen.hidden = false;
    emailInput.value = '';
    passwordInput.value = '';
    setMode('signin');
  }

  tabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.authMode)));
  offline.addEventListener('click', () => enterApp(null, true));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!client) { showMessage('The account service could not load. Check your internet connection, or use local mode.', 'error'); return; }
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    submit.disabled = true;
    submit.textContent = mode === 'signup' ? 'Creating account…' : 'Signing in…';
    message.className = 'auth-message';
    try {
      if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) enterApp(data.user);
        else showMessage('Account created. Check your email for the confirmation link, then return here to sign in.', 'success');
      } else {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        enterApp(data.user);
      }
    } catch (error) {
      showMessage(error?.message || 'Authentication failed. Please try again.', 'error');
    } finally {
      submit.disabled = false;
      submit.innerHTML = mode === 'signup' ? 'Create account <span>→</span>' : 'Sign in <span>→</span>';
    }
  });
  forgot.addEventListener('click', async () => {
    if (!client) { showMessage('The account service could not load. Check your internet connection.', 'error'); return; }
    const email = emailInput.value.trim();
    if (!email) { showMessage('Enter your email address above first, then choose Forgot password.', 'error'); emailInput.focus(); return; }
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: window.location.href.split('#')[0] });
      if (error) throw error;
      showMessage('If an account exists for that email, a password-reset link has been sent.', 'success');
    } catch (error) { showMessage(error?.message || 'Could not send the reset email.', 'error'); }
  });
  document.getElementById('account-signout')?.addEventListener('click', async () => {
    if (localMode) { leaveApp(); return; }
    if (client) await client.auth.signOut();
    leaveApp();
  });

  if (window.supabase?.createClient && config.url && config.publishableKey) {
    client = window.supabase.createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    client.auth.getSession().then(({ data, error }) => {
      if (!error && data?.session?.user) enterApp(data.session.user);
    }).catch(() => {});
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) enterApp(session.user);
      if (event === 'SIGNED_OUT' && !localMode) leaveApp();
    });
  } else {
    showMessage('Account service is unavailable right now. You can retry after reconnecting or continue in local mode.', 'error');
  }
})();
