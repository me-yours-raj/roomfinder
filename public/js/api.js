async function api(path, options) {
  const opts = options || {};
  const headers = Object.assign({}, opts.headers || {});
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (!isForm && opts.body && typeof opts.body === "object") {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.body);
  }
  const response = await fetch(path, Object.assign({ credentials: "same-origin" }, opts, { headers }));
  let data = {};
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_err) {
      data = { message: text };
    }
  }
  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.details = data.details;
    error.status = response.status;
    throw error;
  }
  return data;
}

function formatRent(value) {
  return "₹" + Number(value).toLocaleString("en-IN") + "/mo";
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

function showMessage(el, text, type) {
  if (!el) return;
  el.className = "alert " + (type === "ok" ? "alert-ok" : type === "info" ? "alert-info" : "alert-error");
  el.textContent = text;
  el.classList.remove("hidden");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function listingCard(item) {
  const isDemo = Boolean(item.isDemo);
  const demoBadge = isDemo
    ? '<span class="badge badge-demo">⚠️ DEMO LISTING</span>'
    : '<span class="badge badge-verified">✓ Verified</span>';

  const photo = escapeHtml(item.photo || "/images/demo/room-single-1.svg");
  const depositText = item.deposit && item.deposit > 0 ? "Deposit: ₹" + Number(item.deposit).toLocaleString("en-IN") : "Zero deposit";
  const detailUrl = "/listing.html?id=" + encodeURIComponent(item.id);

  const tags = [];
  if (item.furnishingStatus) tags.push(item.furnishingStatus);
  if (item.tenantPreference && item.tenantPreference !== "Any / All") tags.push(item.tenantPreference);

  const tagsHtml = tags.length
    ? '<div class="card-amenities">' + tags.map(function (t) { return '<span class="card-amenity">' + escapeHtml(t) + '</span>'; }).join("") + '</div>'
    : '';

  return (
    '<article class="card listing-card" data-url="' + detailUrl + '" role="link" tabindex="0" onclick="window.location.href=\'' + detailUrl + '\'">' +
      '<div class="card-media">' +
        '<img src="' + photo + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.onerror=null;this.src=\'/images/demo/room-single-1.svg\';">' +
        '<div class="card-media-tags">' +
          demoBadge +
          '<span class="badge">' + escapeHtml(item.typeLabel || item.type) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="card-body">' +
        '<div class="card-price">' +
          formatRent(item.monthlyRent) +
          '<span class="card-deposit"> (' + depositText + ')</span>' +
        '</div>' +
        '<h3 class="card-title">' + escapeHtml(item.title) + '</h3>' +
        '<div class="card-location">📍 ' + escapeHtml(item.locality) + ', ' + escapeHtml(item.city) + '</div>' +
        tagsHtml +
        '<div class="card-footer">' +
          '<small class="muted">' + (isDemo ? 'Sample Demonstration' : 'Available for Rent') + '</small>' +
          '<a class="btn btn-secondary btn-sm" href="' + detailUrl + '" onclick="event.stopPropagation();">View Details &rarr;</a>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

// Enable keyboard accessibility on listing cards
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const card = e.target.closest && e.target.closest(".listing-card");
    if (card && card.getAttribute("data-url")) {
      window.location.href = card.getAttribute("data-url");
    }
  }
});
