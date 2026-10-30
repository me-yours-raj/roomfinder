(function () {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const registerOtpBox = document.getElementById("register-otp-box");
  const registerOtpForm = document.getElementById("register-otp-form");
  const resendOtpBtn = document.getElementById("resend-otp-btn");
  const otpTargetEmail = document.getElementById("otp-target-email");
  const adminForm = document.getElementById("admin-login-form");
  const forgotForm = document.getElementById("forgot-password-form");
  const resetForm = document.getElementById("reset-password-form");
  const resendResetOtpBtn = document.getElementById("resend-reset-otp-btn");
  const resetSuccessBox = document.getElementById("reset-success-box");
  const msg = document.getElementById("form-msg");
  const otpMsg = document.getElementById("otp-msg");

  let currentRegisterEmail = "";

  function afterLogin(user) {
    if (user.role === "pending") window.location.href = "/select-role.html";
    else if (user.role === "owner") window.location.href = "/owner.html";
    else if (user.role === "student") window.location.href = "/";
    else if (user.role === "admin") window.location.href = "/admin.html";
    else window.location.href = "/";
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;
      if (!email || !password) {
        showMessage(msg, "Enter email and password.", "error");
        return;
      }
      api("/api/auth/login", { method: "POST", body: { email: email, password: password } })
        .then(function (data) {
          afterLogin(data.user);
        })
        .catch(function (err) {
          if (err.details && err.details.requireOtp) {
            showMessage(msg, err.message + " Redirecting to email verification...", "info");
            setTimeout(function () {
              window.location.href = "/register.html?verifyEmail=" + encodeURIComponent(err.details.email || email);
            }, 1500);
            return;
          }
          showMessage(msg, err.message, "error");
        });
    });
  }

  // Handle Registration Step 1 & Step 2 (6-Digit OTP)
  if (registerForm && registerOtpBox) {
    const regSubmitBtn = document.getElementById("reg-submit-btn");

    // Check if redirected here to verify existing unverified email
    const verifyEmailParam = qs("verifyEmail");
    if (verifyEmailParam) {
      currentRegisterEmail = verifyEmailParam;
      if (otpTargetEmail) otpTargetEmail.textContent = currentRegisterEmail;
      registerForm.classList.add("hidden");
      registerOtpBox.classList.remove("hidden");
      showMessage(otpMsg, "Enter the 6-digit verification code sent to " + currentRegisterEmail, "info");
    }

    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = registerForm.name.value.trim();
      const email = registerForm.email.value.trim();
      const role = registerForm.role ? registerForm.role.value : "student";
      const phone = registerForm.phone ? registerForm.phone.value.trim() : "";
      const password = registerForm.password.value;
      const confirm = registerForm.confirm.value;

      if (name.length < 2) return showMessage(msg, "Enter your full name (at least 2 letters).", "error");
      if (!email.includes("@")) return showMessage(msg, "Enter a valid email address.", "error");
      if (password.length < 8) return showMessage(msg, "Password must be at least 8 characters long.", "error");
      if (password !== confirm) return showMessage(msg, "Passwords do not match.", "error");
      if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ""))) {
        return showMessage(msg, "Enter a valid 10-digit Indian mobile number or leave it blank.", "error");
      }

      if (regSubmitBtn) {
        regSubmitBtn.disabled = true;
        regSubmitBtn.textContent = "Sending verification code...";
      }

      api("/api/auth/register", {
        method: "POST",
        body: { name: name, email: email, role: role, password: password, phone: phone }
      })
        .then(function (data) {
          currentRegisterEmail = email;
          if (otpTargetEmail) otpTargetEmail.textContent = email;
          registerForm.classList.add("hidden");
          registerOtpBox.classList.remove("hidden");
          showMessage(otpMsg, data.message, "ok");
          const codeInput = document.getElementById("otp-code");
          if (codeInput) codeInput.focus();
        })
        .catch(function (err) {
          const extra = err.details && Array.isArray(err.details) && err.details.length ? " " + err.details.join(" ") : "";
          showMessage(msg, err.message + extra, "error");
        })
        .finally(function () {
          if (regSubmitBtn) {
            regSubmitBtn.disabled = false;
            regSubmitBtn.textContent = "Register & Receive 6-Digit OTP";
          }
        });
    });

    if (registerOtpForm) {
      registerOtpForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const otp = registerOtpForm.otp.value.trim().replace(/\s+/g, "");
        const verifyBtn = document.getElementById("verify-otp-btn");

        if (!/^\d{6}$/.test(otp)) {
          showMessage(otpMsg, "Please enter a valid 6-digit numeric verification code.", "error");
          return;
        }

        if (verifyBtn) {
          verifyBtn.disabled = true;
          verifyBtn.textContent = "Verifying code...";
        }

        api("/api/auth/verify-registration-otp", {
          method: "POST",
          body: { email: currentRegisterEmail, otp: otp }
        })
          .then(function (data) {
            showMessage(otpMsg, "Email verified successfully! Setting up your session...", "ok");
            setTimeout(function () {
              afterLogin(data.user);
            }, 800);
          })
          .catch(function (err) {
            showMessage(otpMsg, err.message, "error");
          })
          .finally(function () {
            if (verifyBtn) {
              verifyBtn.disabled = false;
              verifyBtn.textContent = "Verify OTP & Complete Registration";
            }
          });
      });
    }

    if (resendOtpBtn) {
      resendOtpBtn.addEventListener("click", function () {
        if (!currentRegisterEmail) return;
        resendOtpBtn.disabled = true;
        resendOtpBtn.textContent = "Resending OTP...";
        api("/api/auth/resend-registration-otp", {
          method: "POST",
          body: { email: currentRegisterEmail }
        })
          .then(function (data) {
            showMessage(otpMsg, data.message, "info");
          })
          .catch(function (err) {
            showMessage(otpMsg, err.message, "error");
          })
          .finally(function () {
            resendOtpBtn.disabled = false;
            resendOtpBtn.textContent = "Resend OTP";
          });
      });
    }
  }

  // Admin login
  if (adminForm) {
    adminForm.addEventListener("submit", function (event) {
      event.preventDefault();
      api("/api/admin/login", {
        method: "POST",
        body: { email: adminForm.email.value.trim(), password: adminForm.password.value }
      })
        .then(function () { window.location.href = "/admin.html"; })
        .catch(function (err) { showMessage(msg, err.message, "error"); });
    });
  }

  // Forgot password form: sends 6-digit OTP
  if (forgotForm) {
    forgotForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const email = forgotForm.email.value.trim();
      const btn = document.getElementById("submit-btn");

      if (!email || !email.includes("@")) {
        showMessage(msg, "Enter a valid registered email address.", "error");
        return;
      }
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending verification code...";
      }
      api("/api/auth/forgot-password", {
        method: "POST",
        body: { email: email }
      })
        .then(function () {
          window.location.href = "/reset-password.html?email=" + encodeURIComponent(email) + "&sent=1";
        })
        .catch(function (err) {
          showMessage(msg, err.message, "error");
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Send 6-Digit Reset Code";
          }
        });
    });
  }

  // Reset password form: verifies 6-digit OTP + sets new password
  if (resetForm) {
    const qEmail = qs("email");
    if (qEmail && resetForm.email) {
      resetForm.email.value = qEmail;
    }
    if (qs("sent") === "1") {
      showMessage(msg, "A 6-digit verification code has been dispatched to your email. Enter it below.", "info");
    }

    resetForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const email = resetForm.email.value.trim();
      const otp = resetForm.otp.value.trim().replace(/\s+/g, "");
      const password = resetForm.password.value;
      const confirm = resetForm.confirm.value;
      const resetBtn = document.getElementById("reset-btn");

      if (!email || !email.includes("@")) {
        showMessage(msg, "Please enter your registered email.", "error");
        return;
      }
      if (!/^\d{6}$/.test(otp)) {
        showMessage(msg, "Please enter the 6-digit numeric verification code.", "error");
        return;
      }
      if (password.length < 8) {
        showMessage(msg, "Password must be at least 8 characters long.", "error");
        return;
      }
      if (password !== confirm) {
        showMessage(msg, "Passwords do not match.", "error");
        return;
      }

      if (resetBtn) {
        resetBtn.disabled = true;
        resetBtn.textContent = "Verifying code & saving...";
      }

      api("/api/auth/reset-password", {
        method: "POST",
        body: {
          email: email,
          otp: otp,
          password: password
        }
      })
        .then(function (data) {
          showMessage(msg, data.message, "ok");
          resetForm.classList.add("hidden");
          if (resetSuccessBox) {
            resetSuccessBox.classList.remove("hidden");
          }
        })
        .catch(function (err) {
          showMessage(msg, err.message, "error");
        })
        .finally(function () {
          if (resetBtn) {
            resetBtn.disabled = false;
            resetBtn.textContent = "Verify Code & Reset Password";
          }
        });
    });

    if (resendResetOtpBtn) {
      resendResetOtpBtn.addEventListener("click", function () {
        const email = resetForm.email.value.trim();
        if (!email || !email.includes("@")) {
          showMessage(msg, "Please enter your email to receive a reset code.", "error");
          return;
        }
        resendResetOtpBtn.disabled = true;
        resendResetOtpBtn.textContent = "Resending OTP...";
        api("/api/auth/forgot-password", {
          method: "POST",
          body: { email: email }
        })
          .then(function () {
            showMessage(msg, "A fresh 6-digit reset code has been dispatched to " + email, "info");
          })
          .catch(function (err) {
            showMessage(msg, err.message, "error");
          })
          .finally(function () {
            resendResetOtpBtn.disabled = false;
            resendResetOtpBtn.textContent = "Resend OTP Code";
          });
      });
    }
  }

  // Eye icon toggle for password inputs
  function setupPasswordToggles() {
    document.querySelectorAll(".password-wrap").forEach(function (wrap) {
      const input = wrap.querySelector("input");
      const btn = wrap.querySelector(".password-toggle-btn");
      if (!input || !btn || btn._hasEyeToggle) return;
      btn._hasEyeToggle = true;

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";

        const eyeOpen = btn.querySelector(".eye-open");
        const eyeClosed = btn.querySelector(".eye-closed");
        if (eyeOpen && eyeClosed) {
          if (isPassword) {
            eyeOpen.classList.add("hidden");
            eyeClosed.classList.remove("hidden");
          } else {
            eyeOpen.classList.remove("hidden");
            eyeClosed.classList.add("hidden");
          }
        }
        const actionLabel = isPassword ? "Hide password" : "Show password";
        btn.setAttribute("aria-label", actionLabel);
        btn.setAttribute("title", actionLabel);
        input.focus();
      });
    });
  }

  setupPasswordToggles();
  document.addEventListener("DOMContentLoaded", setupPasswordToggles);
})();
