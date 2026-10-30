(function () {
  const msg = document.getElementById("form-msg");
  requireUser(["pending", "student", "owner"]).then(function (user) {
    if (!user) return;
    if (user.role !== "pending") {
      showMessage(msg, "Your role is already set.", "info");
    }
  });

  document.querySelectorAll("[data-role]").forEach(function (button) {
    button.addEventListener("click", function () {
      api("/api/auth/select-role", { method: "POST", body: { role: button.getAttribute("data-role") } })
        .then(function (data) {
          if (data.user.role === "owner") window.location.href = "/owner.html";
          else window.location.href = "/profile.html";
        })
        .catch(function (err) { showMessage(msg, err.message, "error"); });
    });
  });
})();
