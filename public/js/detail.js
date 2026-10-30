(function () {
  const root = document.getElementById("detail");
  const id = qs("id");
  if (!root) return;

  if (!id) {
    root.innerHTML =
      '<div class="alert alert-error">Missing listing ID. Please <a href="/listings.html">browse accommodations</a> to select a room.</div>';
    return;
  }

  api("/api/properties/" + encodeURIComponent(id))
    .then(function (data) {
      const p = data.property;

      // Update page title
      document.title = p.title + " — Room Finder Bihar";

      const isDemo = Boolean(p.isDemo);
      const demoBanner = isDemo
        ? '<div class="banner-demo">' +
            '<span style="font-size: 1.4rem; line-height: 1;">ℹ️</span>' +
            '<div>' +
              '<strong>SAMPLE LISTING — Demonstration Property</strong><br>' +
              'This accommodation is a sample demonstration listing. The owner details, phone numbers, and coordinates are demonstration data.' +
            '</div>' +
          '</div>'
        : '';

      const depositText =
        p.deposit && p.deposit > 0
          ? "₹" + Number(p.deposit).toLocaleString("en-IN")
          : "Zero deposit required";

      const occupancyText = p.occupancy || "Contact owner for occupancy";
      const fullAddress = p.address
        ? escapeHtml(p.address)
        : escapeHtml(p.locality) + ", " + escapeHtml(p.city) + ", " + escapeHtml(p.state);

      const facilitiesList = p.facilities && p.facilities.length
        ? '<ul class="facilities">' +
            p.facilities
              .map(function (f) {
                return '<li>✓ ' + escapeHtml(f) + '</li>';
              })
              .join("") +
          '</ul>'
        : '<p class="muted">No specific amenities specified for this room.</p>';

      const photos = p.photos && p.photos.length ? p.photos : ["/images/demo/room-single-1.svg"];
      const thumbsHtml = photos
        .map(function (src, i) {
          return (
            '<img src="' +
            escapeHtml(src) +
            '" alt="Photo ' +
            (i + 1) +
            '" class="' +
            (i === 0 ? "active" : "") +
            '" onerror="this.onerror=null;this.src=\'/images/demo/room-single-1.svg\';">'
          );
        })
        .join("");

      // Available date formatting
      let availDateStr = "Immediate";
      if (p.availabilityDate) {
        try {
          const d = new Date(p.availabilityDate);
          if (!isNaN(d.getTime())) {
            availDateStr = d.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric"
            });
          }
        } catch (_e) {}
      }

      // Recommended & Related Accommodations Section
      let relatedHtml = "";
      if (data.related && data.related.length) {
        relatedHtml =
          '<section class="section" style="margin-top: 3.5rem; padding-top: 2.5rem; border-top: 1px solid var(--line);">' +
            '<div class="section-head">' +
              '<div>' +
                '<h2 style="font-size: 1.7rem; margin-bottom: 0.35rem;">Similar &amp; Recommended Rooms</h2>' +
                '<p class="section-subtitle" style="margin-bottom: 1.5rem;">Explore other verified accommodations in ' + escapeHtml(p.city) + ' and matching room categories.</p>' +
              '</div>' +
              '<a class="btn btn-secondary btn-sm" href="/listings.html?city=' + encodeURIComponent(p.city) + '">Explore More ' + escapeHtml(p.city) + ' Rooms &rarr;</a>' +
            '</div>' +
            '<div class="cards">' +
              data.related.map(listingCard).join("") +
            '</div>' +
          '</section>';
      }

      root.innerHTML =
        demoBanner +
        '<div class="detail-grid">' +
          '<div>' +
            '<!-- PHOTO GALLERY -->' +
            '<div class="gallery">' +
              '<img class="gallery-main" id="main-photo" src="' +
              escapeHtml(photos[0]) +
              '" alt="' +
              escapeHtml(p.title) +
              '" onerror="this.onerror=null;this.src=\'/images/demo/room-single-1.svg\';">' +
              '<div class="thumbs" id="thumbs">' +
                thumbsHtml +
              '</div>' +
            '</div>' +

            '<!-- TITLE & BADGES -->' +
            '<h1 style="font-size: 1.65rem; margin-bottom: 0.5rem;">' +
              escapeHtml(p.title) +
            '</h1>' +
            '<div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1.2rem; flex-wrap: wrap;">' +
              '<span class="badge">' + escapeHtml(p.typeLabel || p.type) + '</span>' +
              (isDemo
                ? '<span class="badge badge-demo">Sample Listing</span>'
                : '<span class="badge badge-verified">Verified Listing</span>') +
              '<span class="muted" style="font-size: 0.88rem;">📍 ' +
                escapeHtml(p.locality) + ', ' + escapeHtml(p.city) + ', ' + escapeHtml(p.state) +
              '</span>' +
            '</div>' +

            '<!-- QUICK SPECIFICATIONS GRID -->' +
            '<div class="detail-specs-grid">' +
              '<div class="spec-box">' +
                '<div class="spec-label">Furnishing</div>' +
                '<div class="spec-val">' + escapeHtml(p.furnishingStatus || "Semi-Furnished") + '</div>' +
              '</div>' +
              '<div class="spec-box">' +
                '<div class="spec-label">Food / Meals</div>' +
                '<div class="spec-val">' + escapeHtml(p.foodAvailability || "None") + '</div>' +
              '</div>' +
              '<div class="spec-box">' +
                '<div class="spec-label">Bathroom</div>' +
                '<div class="spec-val">' + escapeHtml(p.bathroomDetails || "Attached") + '</div>' +
              '</div>' +
              '<div class="spec-box">' +
                '<div class="spec-label">Tenant Preference</div>' +
                '<div class="spec-val">' + escapeHtml(p.tenantPreference || "Any / All") + '</div>' +
              '</div>' +
              '<div class="spec-box">' +
                '<div class="spec-label">Available From</div>' +
                '<div class="spec-val">' + escapeHtml(availDateStr) + '</div>' +
              '</div>' +
              '<div class="spec-box">' +
                '<div class="spec-label">Occupancy</div>' +
                '<div class="spec-val">' + escapeHtml(occupancyText) + '</div>' +
              '</div>' +
            '</div>' +

            '<!-- DESCRIPTION -->' +
            '<h2 style="font-size: 1.25rem; margin-top: 1.5rem;">About This Accommodation</h2>' +
            '<p style="font-size: 1rem; line-height: 1.7; color: var(--ink-light); white-space: pre-line;">' +
              escapeHtml(p.description) +
            '</p>' +

            '<!-- FACILITIES & AMENITIES -->' +
            '<h2 style="font-size: 1.25rem; margin-top: 1.6rem;">Amenities &amp; Facilities</h2>' +
            facilitiesList +

            '<!-- ADDRESS DETAILS -->' +
            '<h2 style="font-size: 1.25rem; margin-top: 1.6rem;">Location &amp; Address</h2>' +
            '<p style="font-size: 0.95rem; margin-bottom: 0.8rem;">' +
              '<strong>Address:</strong> ' + fullAddress +
            '</p>' +

            '<!-- LEAFLET INTERACTIVE MAP WRAPPER -->' +
            '<div class="map-wrap">' +
              '<div class="map-wrap-header">' +
                '<h3>🗺️ Location Map</h3>' +
                (p.location && p.location.lat
                  ? '<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">' +
                      '<a class="btn btn-secondary btn-sm" href="https://www.openstreetmap.org/?mlat=' +
                        p.location.lat + '&mlon=' + p.location.lng +
                        '#map=16/' + p.location.lat + '/' + p.location.lng +
                        '" target="_blank" rel="noopener noreferrer">🗺️ View Full Map</a>' +
                      '<a class="btn btn-ghost btn-sm" href="https://www.google.com/maps/search/?api=1&query=' +
                        p.location.lat + ',' + p.location.lng +
                        '" target="_blank" rel="noopener noreferrer">Directions &nearr;</a>' +
                    '</div>'
                  : '') +
              '</div>' +
              '<div id="detail-map"></div>' +
              '<div class="map-wrap-footer">' +
                '<p class="map-disclaimer">' +
                  (isDemo
                    ? '⚠️ Marker shows approximate demonstration position in ' + escapeHtml(p.city) + '. Not a surveyed real property.'
                    : 'Marker shows approximate neighborhood location in ' + escapeHtml(p.city) + '.') +
                '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<!-- SIDE CARD / OWNER CONTACT BOX -->' +
          '<aside class="card side-card">' +
            '<div class="price">' + formatRent(p.monthlyRent) + '</div>' +
            '<div class="deposit-text">Security Deposit: ' + escapeHtml(depositText) + '</div>' +

            '<hr style="border: 0; border-top: 1px solid var(--line-light); margin: 1rem 0;">' +

            '<div style="font-size: 0.85rem; color: var(--muted); text-transform: uppercase; font-weight: 700; margin-bottom: 0.3rem;">Owner / Property Contact</div>' +
            '<p style="font-weight: 700; margin-bottom: 0.5rem; font-size: 1.05rem;">' +
              escapeHtml(p.ownerName || "Property Manager") +
            '</p>' +

            '<div class="contact-highlight">' +
              '<div style="font-size: 0.78rem; color: var(--muted); margin-bottom: 0.2rem; text-transform: uppercase; font-weight: 600;">Contact Phone Number</div>' +
              '<div class="contact-number" id="contact-number">' +
                escapeHtml(p.contactNumber) +
              '</div>' +
            '</div>' +

            '<button class="btn btn-primary" type="button" id="copy-contact" style="width: 100%; margin-bottom: 0.6rem;">📋 Copy Contact Number</button>' +
            '<div id="copy-msg" class="hidden"></div>' +

            '<a class="btn btn-secondary" href="tel:' + encodeURIComponent(p.contactNumber) + '" style="width: 100%;">📞 Call Property Owner</a>' +

            (isDemo
              ? '<p class="help" style="margin-top: 0.8rem; text-align: center;">Sample demonstration contact number.</p>'
              : '<p class="help" style="margin-top: 0.8rem; text-align: center;">Direct owner contact without brokerage.</p>') +
          '</aside>' +
        '</div>' +
        relatedHtml;

      // Thumbnail click behavior
      const main = document.getElementById("main-photo");
      document.querySelectorAll("#thumbs img").forEach(function (img) {
        img.addEventListener("click", function () {
          main.src = img.src;
          document.querySelectorAll("#thumbs img").forEach(function (node) {
            node.classList.remove("active");
          });
          img.classList.add("active");
        });
      });

      // Copy contact number button
      document.getElementById("copy-contact").addEventListener("click", function () {
        const number = p.contactNumber;
        const msg = document.getElementById("copy-msg");
        function ok() {
          showMessage(msg, "Contact number copied to clipboard!", "ok");
        }
        function fail() {
          showMessage(msg, "Please copy the number manually: " + number, "error");
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(number).then(ok).catch(fail);
        } else {
          const input = document.createElement("input");
          input.value = number;
          document.body.appendChild(input);
          input.select();
          try {
            document.execCommand("copy");
            ok();
          } catch (_e) {
            fail();
          }
          document.body.removeChild(input);
        }
      });

      // Initialize Leaflet Map
      initDetailMap(p);
    })
    .catch(function (err) {
      root.innerHTML =
        '<div class="alert alert-error">' +
        '<h3>Listing Not Available</h3>' +
        '<p>' + escapeHtml(err.message) + '</p>' +
        '<p><a class="btn btn-primary btn-sm" href="/listings.html">Back to Browse Rooms</a></p>' +
        '</div>';
    });

  function initDetailMap(property) {
    const mapEl = document.getElementById("detail-map");
    if (!mapEl) return;

    if (typeof L === "undefined") {
      mapEl.innerHTML =
        '<div class="empty"><p>Interactive map library is initializing…</p></div>';
      return;
    }

    const hasCoords =
      property.location &&
      typeof property.location.lat === "number" &&
      typeof property.location.lng === "number" &&
      !isNaN(property.location.lat) &&
      !isNaN(property.location.lng);

    // Default to central Bihar (Patna ~ 25.6, 85.1) if coords missing
    const lat = hasCoords ? property.location.lat : 25.6139;
    const lng = hasCoords ? property.location.lng : 85.1186;
    const zoom = hasCoords ? 15 : 12;

    try {
      const map = L.map("detail-map", {
        scrollWheelZoom: false,
        attributionControl: true
      }).setView([lat, lng], zoom);

      // OpenStreetMap Foundation Tile Usage Policy compliant configuration:
      // 1. Standard HTTPS canonical URL (no deprecated subdomain sharding)
      // 2. Clear, visible attribution with link to https://www.openstreetmap.org/copyright
      // 3. Strict maxZoom: 19
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);
      const popupHtml =
        '<div style="font-family: sans-serif; font-size: 13px;">' +
        '<strong>' + escapeHtml(property.title) + '</strong><br>' +
        '<span style="color:#0f5c65; font-weight:bold;">' + formatRent(property.monthlyRent) + '</span><br>' +
        '<small>' + escapeHtml(property.locality) + ', ' + escapeHtml(property.city) + '</small>' +
        '</div>';

      marker.bindPopup(popupHtml).openPopup();

      // Trigger map resize check
      setTimeout(function () {
        map.invalidateSize();
      }, 300);
    } catch (e) {
      console.warn("Leaflet map initialization warning:", e.message);
      mapEl.innerHTML =
        '<div class="empty"><p>📍 Approximate location: ' +
        escapeHtml(property.locality) + ', ' + escapeHtml(property.city) + ', ' + escapeHtml(property.state) +
        '</p></div>';
    }
  }
})();
