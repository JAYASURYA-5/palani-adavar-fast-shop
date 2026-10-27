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

document.getElementById("year").textContent = new Date().getFullYear();

// Background videos are decorative; keep them muted and pause them when off-screen.
document.querySelectorAll("video").forEach((video) => {
  video.muted = true;
  video.playsInline = true;
  const playAttempt = video.play();
  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {
      // Some browsers defer autoplay until user interaction; the poster remains visible.
    });
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
// AUTHENTICATION & LOGIN MODAL LOGIC
// =========================================

(function initAuthSystem() {
  const loginBtn = document.getElementById("loginBtn");
  const authModal = document.getElementById("authModal");
  const closeAuthModal = document.getElementById("closeAuthModal");
  const userDropdownMenu = document.getElementById("userDropdownMenu");
  const tabSignIn = document.getElementById("tabSignIn");
  const tabSignUp = document.getElementById("tabSignUp");
  const panelSignIn = document.getElementById("panelSignIn");
  const panelSignUp = document.getElementById("panelSignUp");
  const signInForm = document.getElementById("signInForm");
  const signUpForm = document.getElementById("signUpForm");
  const demoLoginBtn = document.getElementById("demoLoginBtn");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const loginPassword = document.getElementById("loginPassword");
  const authSuccessState = document.getElementById("authSuccessState");
  const successWelcomeMsg = document.getElementById("successWelcomeMsg");
  const continueToMenuBtn = document.getElementById("continueToMenuBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

  // State
  let currentUser = null;

  // Check saved session
  try {
    const saved = localStorage.getItem("palani_user_session");
    if (saved) {
      currentUser = JSON.parse(saved);
      renderLoggedInState(currentUser);
    }
  } catch (e) {
    // local storage fallback
  }

  function openModal() {
    if (!authModal) return;
    // Close mobile menu if open
    if (nav && nav.classList.contains("open")) {
      nav.classList.remove("open");
      if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
      }
    }
    // Reset view
    if (authSuccessState) authSuccessState.style.display = "none";
    if (panelSignIn) panelSignIn.style.display = "block";
    switchTab("signIn");

    authModal.classList.add("is-open");
    authModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Focus initial input
    const identifierInput = document.getElementById("loginIdentifier");
    if (identifierInput) {
      setTimeout(() => identifierInput.focus(), 150);
    }
  }

  function closeModal() {
    if (!authModal) return;
    authModal.classList.remove("is-open");
    authModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (loginBtn) loginBtn.focus();
  }

  function switchTab(tab) {
    if (tab === "signIn") {
      tabSignIn.classList.add("active");
      tabSignIn.setAttribute("aria-selected", "true");
      tabSignUp.classList.remove("active");
      tabSignUp.setAttribute("aria-selected", "false");

      panelSignIn.classList.add("active");
      panelSignIn.removeAttribute("hidden");
      panelSignUp.classList.remove("active");
      panelSignUp.setAttribute("hidden", "true");
    } else {
      tabSignUp.classList.add("active");
      tabSignUp.setAttribute("aria-selected", "true");
      tabSignIn.classList.remove("active");
      tabSignIn.setAttribute("aria-selected", "false");

      panelSignUp.classList.add("active");
      panelSignUp.removeAttribute("hidden");
      panelSignIn.classList.remove("active");
      panelSignIn.setAttribute("hidden", "true");
    }
  }

  function toggleDropdown() {
    if (!userDropdownMenu) return;
    const isActive = userDropdownMenu.classList.toggle("is-active");
    userDropdownMenu.setAttribute("aria-hidden", String(!isActive));
  }

  function closeDropdown() {
    if (userDropdownMenu && userDropdownMenu.classList.contains("is-active")) {
      userDropdownMenu.classList.remove("is-active");
      userDropdownMenu.setAttribute("aria-hidden", "true");
    }
  }

  function renderLoggedInState(user) {
    if (!loginBtn) return;
    loginBtn.classList.add("user-logged-in");
    loginBtn.setAttribute("aria-label", `Account menu for ${user.name}`);
    const initial = (user.name || "U").charAt(0).toUpperCase();

    loginBtn.innerHTML = `
      <span class="user-badge-initial">${initial}</span>
      <span class="login-text">${user.name.split(" ")[0]}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
    `;

    // Update Dropdown Details
    const dropdownUserName = document.getElementById("dropdownUserName");
    const dropdownUserPhone = document.getElementById("dropdownUserPhone");
    const userAvatarInitial = document.getElementById("userAvatarInitial");
    if (dropdownUserName) dropdownUserName.textContent = user.name;
    if (dropdownUserPhone) dropdownUserPhone.textContent = user.identifier || "+91 98765 43210";
    if (userAvatarInitial) userAvatarInitial.textContent = initial;
  }

  function renderLoggedOutState() {
    if (!loginBtn) return;
    loginBtn.classList.remove("user-logged-in");
    loginBtn.setAttribute("aria-label", "Sign in to your account");
    loginBtn.innerHTML = `
      <svg class="login-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <span class="login-text">Login</span>
    `;
    closeDropdown();
  }

  function handleLoginSuccess(user) {
    currentUser = user;
    try {
      localStorage.setItem("palani_user_session", JSON.stringify(user));
    } catch (e) {}

    renderLoggedInState(user);

    // Hide forms, show success state
    if (panelSignIn) panelSignIn.style.display = "none";
    if (panelSignUp) panelSignUp.style.display = "none";
    if (authSuccessState) {
      authSuccessState.style.display = "block";
      if (successWelcomeMsg) {
        successWelcomeMsg.textContent = `Welcome back, ${user.name}! Your account is ready for exclusive specials & fast ordering.`;
      }
    }
  }

  // Event Listeners
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentUser) {
        toggleDropdown();
      } else {
        openModal();
      }
    });
  }

  if (closeAuthModal) {
    closeAuthModal.addEventListener("click", closeModal);
  }

  if (authModal) {
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeDropdown();
    }
  });

  document.addEventListener("click", (e) => {
    if (userDropdownMenu && !userDropdownMenu.contains(e.target) && e.target !== loginBtn) {
      closeDropdown();
    }
  });

  if (tabSignIn && tabSignUp) {
    tabSignIn.addEventListener("click", () => switchTab("signIn"));
    tabSignUp.addEventListener("click", () => switchTab("signUp"));
  }

  // Password visibility toggle
  if (togglePasswordBtn && loginPassword) {
    togglePasswordBtn.addEventListener("click", () => {
      const isPwd = loginPassword.type === "password";
      loginPassword.type = isPwd ? "text" : "password";
      const openIcon = togglePasswordBtn.querySelector(".eye-open");
      const closedIcon = togglePasswordBtn.querySelector(".eye-closed");
      if (openIcon && closedIcon) {
        openIcon.style.display = isPwd ? "none" : "block";
        closedIcon.style.display = isPwd ? "block" : "none";
      }
    });
  }

  // Sign In Form Submit
  if (signInForm) {
    signInForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const identifier = document.getElementById("loginIdentifier")?.value || "Member";
      const displayName = identifier.includes("@") ? identifier.split("@")[0] : identifier;
      const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      
      const submitBtn = signInForm.querySelector(".auth-submit-btn");
      if (submitBtn) {
        submitBtn.innerHTML = `<span>Signing in...</span>`;
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = `<span>Sign In to Account</span><span class="btn-arrow">→</span>`;
          submitBtn.disabled = false;
        }
        handleLoginSuccess({
          name: formattedName || "Food Enthusiast",
          identifier: identifier
        });
      }, 600);
    });
  }

  // Demo Login Quick Button
  if (demoLoginBtn) {
    demoLoginBtn.addEventListener("click", () => {
      const idInput = document.getElementById("loginIdentifier");
      const pwdInput = document.getElementById("loginPassword");
      if (idInput) idInput.value = "98765 43210";
      if (pwdInput) pwdInput.value = "palani123";

      demoLoginBtn.innerHTML = `<span>⚡ Verifying...</span>`;
      setTimeout(() => {
        demoLoginBtn.innerHTML = `<span class="demo-bolt">⚡</span> One-Click Demo Sign In`;
        handleLoginSuccess({
          name: "Senthil Kumar",
          identifier: "+91 98765 43210"
        });
      }, 500);
    });
  }

  // Sign Up Form Submit
  if (signUpForm) {
    signUpForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signUpName")?.value || "New Foodie";
      const identifier = document.getElementById("signUpIdentifier")?.value || "";

      const submitBtn = signUpForm.querySelector(".auth-submit-btn");
      if (submitBtn) {
        submitBtn.innerHTML = `<span>Creating Account...</span>`;
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = `<span>Create Account & Join</span><span class="btn-arrow">→</span>`;
          submitBtn.disabled = false;
        }
        handleLoginSuccess({
          name: name,
          identifier: identifier
        });
      }, 700);
    });
  }

  // Continue to menu button in success modal
  if (continueToMenuBtn) {
    continueToMenuBtn.addEventListener("click", () => {
      closeModal();
      const menuSection = document.getElementById("signature");
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      currentUser = null;
      try {
        localStorage.removeItem("palani_user_session");
      } catch (e) {}
      renderLoggedOutState();
    });
  }

  // Forgot password hint
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener("click", (e) => {
      e.preventDefault();
      alert("A password reset link or OTP can be sent to your registered phone or email.");
    });
  }
})();

