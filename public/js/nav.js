(function () {
  const links = document.getElementById("nav-links");
  const toggle = document.getElementById("nav-toggle");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  api("/api/auth/me")
    .then(function (data) {
      window.currentUser = data.user;
      renderNav(data.user);
    })
    .catch(function () {
      window.currentUser = null;
      renderNav(null);
    });

  function renderNav(user) {
    const authSlot = document.getElementById("nav-auth");
    if (!authSlot) return;

    // Clean up any static role-specific links outside authSlot to eliminate duplicates
    const navLinks = document.getElementById("nav-links");
    if (navLinks) {
      const staticRoleLinks = navLinks.querySelectorAll(
        "a[href*='owner.html'], a[href*='owner-form.html'], a[href*='admin.html']"
      );
      staticRoleLinks.forEach(function (link) {
        if (!link.closest("#nav-auth")) {
          link.remove();
        }
      });
    }

    if (!user) {
      authSlot.innerHTML =
        '<a href="/owner-form.html">List Your Property</a>' +
        '<a class="btn btn-secondary btn-sm nav-login-btn" href="/login.html">Login</a>';
    } else {
      let linksHtml = "";
      if (user.role === "owner") {
        linksHtml =
          '<a href="/owner.html">My Listings</a>' +
          '<a href="/owner-form.html" class="btn btn-accent btn-sm">+ Post Room</a>' +
          '<a href="/profile.html">My Profile</a>';
      } else if (user.role === "admin") {
        linksHtml =
          '<a href="/admin.html">Admin Dashboard</a>';
      } else {
        // student / tenant
        linksHtml =
          '<a href="/owner-form.html">List Your Property</a>' +
          '<a href="/profile.html">My Profile</a>';
      }

      authSlot.innerHTML =
        linksHtml +
        '<button class="btn btn-ghost btn-sm" id="logout-btn" type="button">Log out</button>';

      const btn = document.getElementById("logout-btn");
      if (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          showLogoutConfirmation(function () {
            api("/api/auth/logout", { method: "POST" }).finally(function () {
              window.location.href = "/";
            });
          });
        });
      }
    }

    // Attach dynamic click/press feedback to all interactive navbar elements (including Login and Register)
    bindNavbarPressEffects();
    highlightActiveNavLink();
  }

  // ==========================================================================
  // COOKIE NOTIFICATION BANNER
  // ==========================================================================
  function initCookieBanner() {
    try {
      if (localStorage.getItem("rf_cookie_consent") === "acknowledged") {
        return;
      }
    } catch (e) {
      // Ignore localStorage exceptions in private browsing or restricted environments
    }

    if (document.getElementById("rf-cookie-banner")) return;

    const banner = document.createElement("div");
    banner.id = "rf-cookie-banner";
    banner.className = "rf-cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Cookie and Privacy Notice");
    banner.innerHTML =
      '<div class="rf-cookie-content">' +
        '<span class="rf-cookie-icon" aria-hidden="true">🍪</span>' +
        '<div class="rf-cookie-text">' +
          '<strong>Cookie &amp; Privacy Notice:</strong> We use strictly essential cookies for secure login and account protection. We do not use advertising or tracking cookies. Learn more in our <a href="/cookie-policy.html">Cookie Policy</a> and <a href="/privacy-policy.html">Privacy Policy</a>.' +
        '</div>' +
      '</div>' +
      '<div class="rf-cookie-actions">' +
        '<button type="button" class="btn btn-primary" id="rf-cookie-accept">Got it</button>' +
      '</div>';

    document.body.appendChild(banner);

    const acceptBtn = banner.querySelector("#rf-cookie-accept");
    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        try {
          localStorage.setItem("rf_cookie_consent", "acknowledged");
        } catch (e) {}
        banner.style.transition = "opacity 0.25s ease, transform 0.25s ease";
        banner.style.opacity = "0";
        banner.style.transform = "translate(-50%, 20px)";
        setTimeout(function () {
          if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 260);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(initCookieBanner, 400);
    });
  } else {
    setTimeout(initCookieBanner, 400);
  }

  // Confirm logout modal dialog asking the user to confirm that they really want to log out
  function showLogoutConfirmation(onConfirm) {
    let modal = document.getElementById("logout-confirm-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "logout-confirm-modal";
      modal.className = "logout-modal-overlay hidden";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-labelledby", "logout-modal-title");
      modal.innerHTML =
        '<div class="logout-modal-card">' +
          '<div class="logout-modal-icon-wrap">' +
            '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>' +
              '<polyline points="16 17 21 12 16 7"></polyline>' +
              '<line x1="21" y1="12" x2="9" y2="12"></line>' +
            '</svg>' +
          '</div>' +
          '<h3 id="logout-modal-title">Confirm Logout</h3>' +
          '<p>Are you sure you really want to log out of your Room Finder account?</p>' +
          '<div class="logout-modal-actions">' +
            '<button type="button" class="btn btn-secondary" id="logout-modal-cancel">Cancel</button>' +
            '<button type="button" class="btn btn-primary" id="logout-modal-confirm" style="background: #dc2626; border-color: #dc2626; color: #ffffff;">Yes, Log Out</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(modal);

      modal.addEventListener("click", function (e) {
        if (e.target === modal) {
          closeModal();
        }
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) {
          closeModal();
        }
      });
    }

    function closeModal() {
      modal.classList.add("hidden");
    }

    const cancelBtn = modal.querySelector("#logout-modal-cancel");
    const confirmBtn = modal.querySelector("#logout-modal-confirm");

    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Yes, Log Out";
    }

    cancelBtn.onclick = function () {
      closeModal();
    };

    confirmBtn.onclick = function () {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Logging out…";
      onConfirm();
    };

    modal.classList.remove("hidden");
    if (cancelBtn) cancelBtn.focus();
  }

  // Dynamic background color change and tactile press feedback on any navbar button or link
  function bindNavbarPressEffects() {
    const targets = document.querySelectorAll(
      ".site-header a, .site-header button, .nav-toggle, .nav-links a, .nav-links button, .btn"
    );
    targets.forEach(function (el) {
      if (el._navPressBound) return;
      el._navPressBound = true;

      function handlePress() {
        el.classList.add("is-pressed");
      }
      function handleRelease() {
        setTimeout(function () {
          el.classList.remove("is-pressed");
        }, 180);
      }

      el.addEventListener("mousedown", handlePress);
      el.addEventListener("touchstart", handlePress, { passive: true });
      el.addEventListener("mouseup", handleRelease);
      el.addEventListener("mouseleave", handleRelease);
      el.addEventListener("touchend", handleRelease);

      // Instant active state switch on click for navigation links
      if (el.tagName === "A" && el.closest("#nav-links")) {
        el.addEventListener("click", function () {
          document.querySelectorAll("#nav-links a").forEach(function (other) {
            other.classList.remove("active");
          });
          el.classList.add("active");
        });
      }
    });
  }

  // Highlight current page active link automatically based on URL
  function highlightActiveNavLink() {
    const path = window.location.pathname.toLowerCase();
    document.querySelectorAll("#nav-links a").forEach(function (link) {
      const href = link.getAttribute("href");
      if (!href) return;
      const cleanHref = href.split("?")[0].toLowerCase();
      if ((path === "/" || path === "/index.html") && (cleanHref === "/" || cleanHref === "/index.html")) {
        link.classList.add("active");
      } else if (cleanHref !== "/" && path.includes(cleanHref)) {
        link.classList.add("active");
      }
    });
  }

  bindNavbarPressEffects();
  highlightActiveNavLink();

  window.requireUser = function (allowedRoles) {
    return api("/api/auth/me").then(function (data) {
      if (!data.user) {
        window.location.href = "/login.html";
        return null;
      }
      if (data.user.role === "pending" && !allowedRoles.includes("pending")) {
        window.location.href = "/select-role.html";
        return null;
      }
      if (allowedRoles && allowedRoles.length && !allowedRoles.includes(data.user.role)) {
        window.location.href = "/";
        return null;
      }
      return data.user;
    });
  };
})();
