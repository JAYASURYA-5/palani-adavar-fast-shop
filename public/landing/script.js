// Clear any stale auth sessions when the landing page loads (handles logout + refresh cases)
try { localStorage.removeItem('palani_admin_session'); } catch (_) {}

// ── Mobile nav toggle ───────────────────────────────────────────
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    menuToggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
    nav.classList.toggle("open", !open);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

// ── Reveal on scroll ─────────────────────────────────────────────
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// ── Year in footer ───────────────────────────────────────────────
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Background video pause/play ──────────────────────────────────
document.querySelectorAll("video").forEach((video) => {
  video.muted = true;
  video.playsInline = true;
  const playAttempt = video.play();
  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {});
  }
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }, { threshold: 0.05 });
    videoObserver.observe(video);
  }
});

// =========================================
// ADMIN LOGIN MODAL LOGIC
// Validates credentials → redirects to React dashboard /login
// =========================================

(function initAdminAuth() {
  const loginBtn        = document.getElementById("loginBtn");
  const authModal       = document.getElementById("authModal");
  const closeAuthModal  = document.getElementById("closeAuthModal");
  const signInForm      = document.getElementById("signInForm");
  const signInSubmitBtn = document.getElementById("signInSubmitBtn");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const loginPassword   = document.getElementById("loginPassword");
  const authSuccessState = document.getElementById("authSuccessState");
  const successWelcomeMsg = document.getElementById("successWelcomeMsg");
  const panelSignIn     = document.getElementById("panelSignIn");
  const loginError      = document.getElementById("loginError");

  // ── Known admin credentials (mirrors Login.tsx) ─────────────────
  // The React admin dashboard also accepts these via its own auth.
  // Here we just gate access to the /login route after a quick check.
  const ADMIN_CREDENTIALS = [
    { email: "palani@andavarfastfood.com",  password: "password123", name: "Palani Andavar" },
    { email: "arumugam@andavarfastfood.com", password: "password123", name: "Arumugam K" },
    { email: "muthu@andavarfastfood.com",    password: "password123", name: "Muthu Swamy" },
    { email: "selvam@andavarfastfood.com",   password: "password123", name: "Selvam R" },
  ];

  // ── Open Modal ───────────────────────────────────────────────────
  function openModal() {
    if (!authModal) return;
    // Close mobile nav if open
    if (nav && nav.classList.contains("open")) {
      nav.classList.remove("open");
      if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
      }
    }
    // Reset to sign-in panel
    if (authSuccessState) authSuccessState.style.display = "none";
    if (panelSignIn) panelSignIn.style.display = "block";
    if (loginError) { loginError.style.display = "none"; loginError.textContent = ""; }

    authModal.classList.add("is-open");
    authModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      const idInput = document.getElementById("loginIdentifier");
      if (idInput) idInput.focus();
    }, 150);
  }

  // ── Close Modal ──────────────────────────────────────────────────
  function closeModal() {
    if (!authModal) return;
    authModal.classList.remove("is-open");
    authModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (loginBtn) loginBtn.focus();
  }

  // ── Show Error ───────────────────────────────────────────────────
  function showError(msg) {
    if (!loginError) return;
    loginError.textContent = msg;
    loginError.style.display = "block";
  }

  // ── Handle successful login → redirect ───────────────────────────
  function handleLoginSuccess(adminName) {
    // Show success panel
    if (panelSignIn) panelSignIn.style.display = "none";
    if (authSuccessState) {
      authSuccessState.style.display = "block";
      if (successWelcomeMsg) {
        successWelcomeMsg.textContent = `Welcome, ${adminName}! Redirecting to Admin Dashboard…`;
      }
    }

    // Write one-time session flag to sessionStorage.
    // The React store reads & immediately deletes this on first load.
    // Any page refresh clears the auth and sends the user back to the landing page.
    try {
      sessionStorage.setItem('palani_admin_session', JSON.stringify({ name: adminName, ts: Date.now() }));
    } catch (e) {}

    // Redirect directly to React admin dashboard after a short delay
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1200);
  }

  // ── Listeners ────────────────────────────────────────────────────
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal();
    });
  }

  if (closeAuthModal) closeAuthModal.addEventListener("click", closeModal);

  if (authModal) {
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Password visibility toggle
  if (togglePasswordBtn && loginPassword) {
    togglePasswordBtn.addEventListener("click", () => {
      const isPwd = loginPassword.type === "password";
      loginPassword.type = isPwd ? "text" : "password";
      const openIcon   = togglePasswordBtn.querySelector(".eye-open");
      const closedIcon = togglePasswordBtn.querySelector(".eye-closed");
      if (openIcon && closedIcon) {
        openIcon.style.display   = isPwd ? "none"  : "block";
        closedIcon.style.display = isPwd ? "block" : "none";
      }
    });
  }

  // ── Sign In Form Submit ──────────────────────────────────────────
  if (signInForm) {
    signInForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (loginError) { loginError.style.display = "none"; loginError.textContent = ""; }

      const identifier = (document.getElementById("loginIdentifier")?.value || "").trim().toLowerCase();
      const password   = (document.getElementById("loginPassword")?.value  || "");

      // Loading state
      if (signInSubmitBtn) {
        signInSubmitBtn.innerHTML = `<span>Verifying…</span>`;
        signInSubmitBtn.disabled = true;
      }

      setTimeout(() => {
        // Validate against known admin credentials
        const match = ADMIN_CREDENTIALS.find(
          (cred) => cred.email.toLowerCase() === identifier && cred.password === password
        );

        if (match) {
          handleLoginSuccess(match.name);
        } else {
          // Reset button
          if (signInSubmitBtn) {
            signInSubmitBtn.innerHTML = `<span>Sign In to Dashboard</span><span class="btn-arrow">→</span>`;
            signInSubmitBtn.disabled = false;
          }
          showError("Invalid email or password. Please check your credentials.");
        }
      }, 700);
    });
  }
})();
