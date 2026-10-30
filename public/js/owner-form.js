(function () {
  const form = document.getElementById("listing-form");
  const msg = document.getElementById("form-msg");
  const photoInput = document.getElementById("photo-input");
  const previewsContainer = document.getElementById("photo-previews");
  const existingContainer = document.getElementById("existing-photos");
  const submitBtn = document.getElementById("submit-btn");

  const id = qs("id");
  let existingPhotos = [];
  let selectedFiles = []; // Array of File objects

  requireUser(["owner"]).then(function (user) {
    if (!user) return;
    return api("/api/meta/options").then(function (data) {
      const typeSelect = document.getElementById("type");
      typeSelect.innerHTML = data.roomTypes
        .map(function (item) {
          return '<option value="' + item.value + '">' + escapeHtml(item.label) + '</option>';
        })
        .join("");

      document.getElementById("facilities").innerHTML = data.facilities
        .map(function (item) {
          return (
            '<label><input type="checkbox" name="facilities" value="' +
            escapeHtml(item) +
            '"> ' +
            escapeHtml(item) +
            '</label>'
          );
        })
        .join("");

      if (id) {
        document.getElementById("form-title").textContent = "Edit Property Listing";
        if (submitBtn) submitBtn.textContent = "Save Changes";
        return loadExisting();
      }
    });
  });

  function loadExisting() {
    return api("/api/properties/mine")
      .then(function (data) {
        const p = data.properties.filter(function (item) {
          return item.id === id;
        })[0];

        if (!p) {
          showMessage(msg, "You can only edit your own listings.", "error");
          return;
        }

        form.title.value = p.title || "";
        form.type.value = p.type || "";
        form.monthlyRent.value = p.monthlyRent || "";
        form.deposit.value = p.deposit != null ? p.deposit : "";
        form.city.value = p.city || "";
        form.locality.value = p.locality || "";
        form.address.value = p.address || "";
        form.description.value = p.description || "";
        form.occupancy.value = p.occupancy || "";
        form.contactNumber.value = p.contactNumber || "";

        if (p.location) {
          if (form.lat && p.location.lat) form.lat.value = p.location.lat;
          if (form.lng && p.location.lng) form.lng.value = p.location.lng;
        }

        if (form.furnishingStatus && p.furnishingStatus) {
          form.furnishingStatus.value = p.furnishingStatus;
        }
        if (form.foodAvailability && p.foodAvailability) {
          form.foodAvailability.value = p.foodAvailability;
        }
        if (form.bathroomDetails && p.bathroomDetails) {
          form.bathroomDetails.value = p.bathroomDetails;
        }
        if (form.tenantPreference && p.tenantPreference) {
          form.tenantPreference.value = p.tenantPreference;
        }

        if (p.availabilityDate && form.availabilityDate) {
          try {
            form.availabilityDate.value = new Date(p.availabilityDate)
              .toISOString()
              .split("T")[0];
          } catch (_e) {}
        }

        existingPhotos = p.photos || [];
        (p.facilities || []).forEach(function (name) {
          const box = form.querySelector('input[name="facilities"][value="' + name + '"]');
          if (box) box.checked = true;
        });

        renderExistingPhotos();
      })
      .catch(function (err) {
        showMessage(msg, err.message, "error");
      });
  }

  function renderExistingPhotos() {
    if (!existingPhotos.length) {
      existingContainer.innerHTML = "";
      updatePhotoCountBadge();
      return;
    }
    existingContainer.innerHTML =
      '<p style="font-weight:600; margin: 0.8rem 0 0.4rem; font-size: 0.9rem;">Existing photos (uncheck to remove):</p>' +
      '<div class="photo-preview-grid">' +
      existingPhotos
        .map(function (src) {
          return (
            '<div class="photo-preview-item">' +
              '<img src="' + escapeHtml(src) + '" alt="Existing photo">' +
              '<label style="position:absolute; bottom:2px; left:2px; background:rgba(0,0,0,0.7); color:#fff; font-size:11px; padding:2px 4px; border-radius:3px;">' +
                '<input type="checkbox" name="keepPhotos" value="' + escapeHtml(src) + '" checked> Keep' +
              '</label>' +
            '</div>'
          );
        })
        .join("") +
      '</div>';

    existingContainer.querySelectorAll('input[name="keepPhotos"]').forEach(function (box) {
      box.addEventListener("change", updatePhotoCountBadge);
    });
    updatePhotoCountBadge();
  }

  const addMorePhotosBtn = document.getElementById("add-more-photos-btn");
  const photoCountBadge = document.getElementById("photo-count-badge");

  function updatePhotoCountBadge() {
    if (!photoCountBadge) return;
    const keptCount = id ? getKeptPhotosCount() : 0;
    const totalCount = keptCount + selectedFiles.length;
    photoCountBadge.textContent = totalCount + " / 4 photos selected";
    if (totalCount >= 4) {
      photoCountBadge.style.color = "var(--brand)";
    } else {
      photoCountBadge.style.color = "var(--muted)";
    }
  }

  if (addMorePhotosBtn) {
    addMorePhotosBtn.addEventListener("click", function () {
      const totalAllowed = 4 - (id ? getKeptPhotosCount() : 0);
      if (selectedFiles.length >= totalAllowed) {
        showMessage(msg, "Maximum " + totalAllowed + " photos allowed. Remove a photo to add a new one.", "error");
        return;
      }
      photoInput.click();
    });
  }

  // Handle Photo File Selection with Live Preview & Removal
  if (photoInput) {
    photoInput.addEventListener("change", function (e) {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      const totalAllowed = 4 - (id ? getKeptPhotosCount() : 0);
      const remainingSlots = totalAllowed - selectedFiles.length;
      if (remainingSlots <= 0) {
        showMessage(msg, "Maximum " + totalAllowed + " photos allowed. Remove a photo first.", "error");
        photoInput.value = "";
        return;
      }

      const filesToAdd = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        showMessage(msg, "Only " + remainingSlots + " more photo" + (remainingSlots === 1 ? "" : "s") + " could be added (max 4 total).", "info");
      }

      filesToAdd.forEach(function (file) {
        if (file.size > 2 * 1024 * 1024) {
          showMessage(msg, 'File "' + file.name + '" exceeds the 2 MB limit.', "error");
          return;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          showMessage(msg, 'File "' + file.name + '" is not a supported JPG, PNG, or WEBP image.', "error");
          return;
        }
        const exists = selectedFiles.some(function (f) {
          return f.name === file.name && f.size === file.size;
        });
        if (!exists) {
          selectedFiles.push(file);
        }
      });

      // Clear input so same file can be selected again if needed
      photoInput.value = "";
      renderPreviews();
    });
  }

  function getKeptPhotosCount() {
    return Array.from(form.querySelectorAll('input[name="keepPhotos"]:checked')).length;
  }

  function renderPreviews() {
    previewsContainer.innerHTML = "";
    updatePhotoCountBadge();
    if (!selectedFiles.length) return;

    selectedFiles.forEach(function (file, index) {
      const reader = new FileReader();
      const div = document.createElement("div");
      div.className = "photo-preview-item";

      const img = document.createElement("img");
      img.alt = file.name;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "photo-remove-btn";
      removeBtn.innerHTML = "&times;";
      removeBtn.title = "Remove photo";
      removeBtn.addEventListener("click", function () {
        selectedFiles.splice(index, 1);
        renderPreviews();
      });

      reader.onload = function (e) {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);

      div.appendChild(img);
      div.appendChild(removeBtn);
      previewsContainer.appendChild(div);
    });
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const keep = Array.prototype.map.call(
        form.querySelectorAll('input[name="keepPhotos"]:checked'),
        function (el) {
          return el.value;
        }
      );

      const totalPhotos = (id ? keep.length : 0) + selectedFiles.length;

      if (totalPhotos < 1) {
        showMessage(msg, "Please provide at least 1 photo for your listing.", "error");
        return;
      }
      if (totalPhotos > 4) {
        showMessage(msg, "Total photos must not exceed 4.", "error");
        return;
      }

      const formData = new FormData();
      formData.set("title", form.title.value.trim());
      formData.set("type", form.type.value);
      formData.set("monthlyRent", form.monthlyRent.value);
      if (form.deposit.value) formData.set("deposit", form.deposit.value);
      formData.set("city", form.city.value.trim());
      formData.set("locality", form.locality.value.trim());
      if (form.address.value.trim()) formData.set("address", form.address.value.trim());
      if (form.lat && form.lat.value) formData.set("lat", form.lat.value);
      if (form.lng && form.lng.value) formData.set("lng", form.lng.value);
      if (form.furnishingStatus) formData.set("furnishingStatus", form.furnishingStatus.value);
      if (form.foodAvailability) formData.set("foodAvailability", form.foodAvailability.value);
      if (form.bathroomDetails) formData.set("bathroomDetails", form.bathroomDetails.value);
      if (form.tenantPreference) formData.set("tenantPreference", form.tenantPreference.value);
      if (form.availabilityDate && form.availabilityDate.value) {
        formData.set("availabilityDate", form.availabilityDate.value);
      }
      if (form.occupancy.value.trim()) formData.set("occupancy", form.occupancy.value.trim());
      formData.set("contactNumber", form.contactNumber.value.trim());
      formData.set("description", form.description.value.trim());

      // Facilities checkboxes
      const facilities = Array.from(
        form.querySelectorAll('input[name="facilities"]:checked')
      ).map(function (el) {
        return el.value;
      });
      formData.set("facilities", facilities.join(","));

      if (id) {
        keep.forEach(function (url) {
          formData.append("keepPhotos", url);
        });
      }

      selectedFiles.forEach(function (file) {
        formData.append("photos", file);
      });

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Saving listing…";
      }

      const method = id ? "PUT" : "POST";
      const endpoint = id ? "/api/properties/" + encodeURIComponent(id) : "/api/properties";

      api(endpoint, { method: method, body: formData })
        .then(function () {
          window.location.href = "/owner.html";
        })
        .catch(function (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = id ? "Save Changes" : "Save & Publish Listing";
          }
          const text = err.details && err.details.length ? err.details.join(" ") : err.message;
          showMessage(msg, text, "error");
        });
    });
  }

  // Handle Cancel button: safely navigate back or fallback to listings/home without jumping to login
  const cancelBtn = document.getElementById("cancel-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (
        document.referrer &&
        document.referrer.indexOf(window.location.origin) === 0 &&
        !document.referrer.includes("/login") &&
        !document.referrer.includes("/register") &&
        !document.referrer.includes("/forgot-password") &&
        !document.referrer.includes("/reset-password")
      ) {
        window.history.back();
      } else {
        window.location.href = "/listings.html";
      }
    });
  }
})();
