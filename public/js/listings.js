(function () {
  const form = document.getElementById("search-form");
  const results = document.getElementById("results");
  const resultsCount = document.getElementById("results-count");
  const resetBtn = document.getElementById("reset-btn");
  const activeFiltersContainer = document.getElementById("active-filters-tags");

  const city = document.getElementById("city");
  const locality = document.getElementById("locality");
  const minRent = document.getElementById("minRent");
  const maxRent = document.getElementById("maxRent");

  // Read URL query params
  if (city) city.value = qs("city");
  if (locality) locality.value = qs("locality");
  if (minRent) minRent.value = qs("minRent");
  if (maxRent) maxRent.value = qs("maxRent");

  let currentType = qs("type");

  function buildParams() {
    const params = new URLSearchParams();
    if (city && city.value.trim()) params.set("city", city.value.trim());
    if (locality && locality.value.trim()) params.set("locality", locality.value.trim());
    if (minRent && minRent.value.trim()) params.set("minRent", minRent.value.trim());
    if (maxRent && maxRent.value.trim()) params.set("maxRent", maxRent.value.trim());
    if (currentType) params.set("type", currentType);
    return params;
  }

  function renderActiveFilterTags() {
    if (!activeFiltersContainer) return;
    const tags = [];

    if (city && city.value.trim()) {
      tags.push({ label: "City: " + city.value.trim(), clear: function () { city.value = ""; } });
    }
    if (locality && locality.value.trim()) {
      tags.push({ label: "Area: " + locality.value.trim(), clear: function () { locality.value = ""; } });
    }
    if (currentType) {
      tags.push({ label: "Type: " + currentType, clear: function () { currentType = ""; } });
    }
    if (minRent && minRent.value.trim() && maxRent && maxRent.value.trim()) {
      tags.push({
        label: "Rent: ₹" + Number(minRent.value).toLocaleString("en-IN") + " – ₹" + Number(maxRent.value).toLocaleString("en-IN"),
        clear: function () { minRent.value = ""; maxRent.value = ""; }
      });
    } else if (minRent && minRent.value.trim()) {
      tags.push({
        label: "Min Rent: ₹" + Number(minRent.value).toLocaleString("en-IN"),
        clear: function () { minRent.value = ""; }
      });
    } else if (maxRent && maxRent.value.trim()) {
      tags.push({
        label: "Max Rent: ₹" + Number(maxRent.value).toLocaleString("en-IN"),
        clear: function () { maxRent.value = ""; }
      });
    }

    if (!tags.length) {
      activeFiltersContainer.innerHTML = "";
      return;
    }

    activeFiltersContainer.innerHTML = tags.map(function (t, i) {
      return '<span class="active-tag">' + escapeHtml(t.label) + ' <span class="tag-remove" data-index="' + i + '" title="Remove filter">&times;</span></span>';
    }).join("") + '<button type="button" class="btn btn-ghost btn-sm" id="clear-all-tags-btn" style="padding: 0.2rem 0.6rem; font-size: 0.8rem; margin-left: 0.3rem;">Clear All</button>';

    activeFiltersContainer.querySelectorAll(".tag-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const idx = Number(btn.dataset.index);
        if (tags[idx]) {
          tags[idx].clear();
          applySearch();
        }
      });
    });

    const clearAllBtn = document.getElementById("clear-all-tags-btn");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", resetFilters);
    }
  }

  function applySearch() {
    const params = buildParams();
    const queryStr = params.toString();
    history.replaceState({}, "", "/listings.html" + (queryStr ? "?" + queryStr : ""));
    search();
  }

  function search() {
    const params = buildParams();
    renderActiveFilterTags();

    results.innerHTML = '<p class="loading">Searching accommodations in Bihar…</p>';

    api("/api/properties?" + params.toString())
      .then(function (data) {
        const count = data.properties ? data.properties.length : 0;
        if (resultsCount) {
          resultsCount.textContent = count + " Accommodation" + (count === 1 ? "" : "s") + " Available in Bihar";
        }

        if (!count) {
          results.innerHTML =
            '<div class="empty" style="grid-column: 1 / -1;">' +
            '<h3>No accommodations match your search</h3>' +
            '<p class="muted">Try adjusting your filters, expanding your rent range, or searching for a broader city like Patna or Gaya.</p>' +
            '<button class="btn btn-secondary btn-sm" id="empty-reset-btn" type="button">Reset All Filters</button>' +
            '</div>';

          const emptyResetBtn = document.getElementById("empty-reset-btn");
          if (emptyResetBtn) {
            emptyResetBtn.addEventListener("click", resetFilters);
          }
          return;
        }

        results.innerHTML = data.properties.map(listingCard).join("");
      })
      .catch(function (err) {
        results.innerHTML = '<p class="alert alert-error" style="grid-column: 1 / -1;">' + escapeHtml(err.message) + '</p>';
      });
  }

  function resetFilters() {
    if (city) city.value = "";
    if (locality) locality.value = "";
    if (minRent) minRent.value = "";
    if (maxRent) maxRent.value = "";
    currentType = "";
    history.replaceState({}, "", "/listings.html");
    search();
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applySearch();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetFilters);
  }

  search();
})();
