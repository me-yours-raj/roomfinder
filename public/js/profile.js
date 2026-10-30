(function () {
  const viewSection = document.getElementById("profile-view-section");
  const editForm = document.getElementById("profile-form");
  const formMsg = document.getElementById("form-msg");
  const btnToggleEdit = document.getElementById("btn-toggle-edit");
  const btnEditTrigger = document.getElementById("btn-edit-profile-trigger");
  const btnCancelEdit = document.getElementById("btn-cancel-edit");
  const saveBtn = document.getElementById("save-btn");

  const avatarInitial = document.getElementById("avatar-initial");
  const headerName = document.getElementById("header-name");
  const headerRoleBadge = document.getElementById("header-role-badge");
  const viewName = document.getElementById("view-name");
  const viewEmail = document.getElementById("view-email");
  const viewPhone = document.getElementById("view-phone");
  const viewRole = document.getElementById("view-role");
  const roleQuickAction = document.getElementById("role-quick-action");

  let currentUserData = null;

  function renderProfileView(user) {
    if (!user) return;
    const initial = (user.name && user.name.trim().charAt(0).toUpperCase()) || "U";
    if (avatarInitial) avatarInitial.textContent = initial;
    if (headerName) headerName.textContent = user.name || "Your Account Profile";

    const roleTitle = user.role === "owner" ? "Property Owner" : "Student / Room Seeker";
    if (headerRoleBadge) headerRoleBadge.textContent = roleTitle;
    if (viewName) viewName.textContent = user.name || "—";
    if (viewEmail) viewEmail.textContent = user.email || "—";
    if (viewPhone) viewPhone.textContent = user.phone ? user.phone : "Not provided";
    if (viewRole) viewRole.textContent = roleTitle;

    if (roleQuickAction) {
      if (user.role === "owner") {
        roleQuickAction.innerHTML = '<a href="/owner.html" class="btn btn-secondary">Manage My Listings &rarr;</a>';
      } else {
        roleQuickAction.innerHTML = '<a href="/listings.html" class="btn btn-secondary">Browse Available Rooms &rarr;</a>';
      }
    }

    if (editForm) {
      editForm.name.value = user.name || "";
      editForm.email.value = user.email || "";
      editForm.phone.value = user.phone || "";
    }
  }

  function openEditMode() {
    if (formMsg) {
      formMsg.classList.add("hidden");
      formMsg.textContent = "";
    }
    if (editForm && currentUserData) {
      editForm.name.value = currentUserData.name || "";
      editForm.phone.value = currentUserData.phone || "";
    }
    if (viewSection) viewSection.classList.add("hidden");
    if (editForm) editForm.classList.remove("hidden");
    if (btnToggleEdit) btnToggleEdit.classList.add("hidden");
    if (editForm && editForm.name) {
      editForm.name.focus();
    }
  }

  function closeEditMode() {
    if (formMsg) {
      formMsg.classList.add("hidden");
      formMsg.textContent = "";
    }
    if (editForm && currentUserData) {
      editForm.name.value = currentUserData.name || "";
      editForm.phone.value = currentUserData.phone || "";
    }
    if (editForm) editForm.classList.add("hidden");
    if (viewSection) viewSection.classList.remove("hidden");
    if (btnToggleEdit) btnToggleEdit.classList.remove("hidden");
  }

  if (btnToggleEdit) {
    btnToggleEdit.addEventListener("click", openEditMode);
  }
  if (btnEditTrigger) {
    btnEditTrigger.addEventListener("click", openEditMode);
  }
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener("click", closeEditMode);
  }

  requireUser(["student", "owner"]).then(function (user) {
    if (!user) return;
    currentUserData = user;
    renderProfileView(user);
  });

  if (editForm) {
    editForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const updatedName = editForm.name.value.trim();
      const updatedPhone = editForm.phone.value.trim();

      if (!updatedName || updatedName.length < 2 || updatedName.length > 60) {
        showMessage(formMsg, "Please enter a valid full name (2–60 characters).", "error");
        return;
      }

      if (updatedPhone && !/^[6-9]\d{9}$/.test(updatedPhone)) {
        showMessage(formMsg, "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210) or leave it empty.", "error");
        return;
      }

      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";
      }

      api("/api/auth/profile", {
        method: "PUT",
        body: { name: updatedName, phone: updatedPhone }
      })
        .then(function (data) {
          currentUserData.name = data.user.name;
          currentUserData.phone = data.user.phone || "";
          if (window.currentUser) {
            window.currentUser.name = data.user.name;
            window.currentUser.phone = data.user.phone || "";
          }
          renderProfileView(currentUserData);
          closeEditMode();
          showMessage(formMsg, data.message || "Profile updated successfully.", "ok");
        })
        .catch(function (err) {
          showMessage(formMsg, err.message || "Failed to update profile.", "error");
        })
        .finally(function () {
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Save Changes";
          }
        });
    });
  }
})();
