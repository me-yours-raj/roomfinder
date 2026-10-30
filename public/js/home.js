(function () {
  const latest = document.getElementById("latest-listings");
  const cities = document.getElementById("city-tiles");

  if (latest) {
    latest.innerHTML = '<p class="loading">Loading featured listings across Bihar…</p>';
    api("/api/properties?latest=1")
      .then(function (data) {
        if (!data.properties.length) {
          latest.innerHTML =
            '<div class="empty">No accommodations found yet. Property owners can list rooms from their dashboard, or run <code>npm run seed</code> to populate demonstration data.</div>';
          return;
        }
        latest.innerHTML = data.properties.map(listingCard).join("");
      })
      .catch(function (err) {
        latest.innerHTML = '<p class="alert alert-error">' + escapeHtml(err.message) + "</p>";
      });
  }

  if (cities) {
    api("/api/meta/locations")
      .then(function (data) {
        cities.innerHTML = data.cities
          .map(function (item) {
            return (
              '<a class="location-tile" href="/listings.html?city=' +
              encodeURIComponent(item.city) +
              '">' +
              '<h3>📍 ' + escapeHtml(item.city) + '</h3>' +
              '<p>' + escapeHtml(item.localities.slice(0, 3).join(", ")) + ' and more</p>' +
              '</a>'
            );
          })
          .join("");
      })
      .catch(function () {
        cities.innerHTML = "<p class=\"muted\">Popular locations could not be loaded at this time.</p>";
      });
  }
})();
