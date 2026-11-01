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

      // WhatsApp link preparation
      const rawNumber = String(p.contactNumber || "").replace(/\D/g, "");
      const waDigits = rawNumber.length === 10 ? "91" + rawNumber : rawNumber;
      const waText = encodeURIComponent(
        'नमस्ते! मैंने Room Finder पर आपका कमरा "' + (p.title || "") + '" देखा (' + (p.locality || "") + ", " + (p.city || "") + ')। क्या यह अभी उपलब्ध है?'
      );
      const waUrl = "https://wa.me/" + waDigits + "?text=" + waText;

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

            '<a class="btn btn-whatsapp" href="' + waUrl + '" target="_blank" rel="noopener noreferrer" style="width: 100%; margin-bottom: 0.65rem;">' +
              '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">' +
                '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 18.08c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.04 8.04 0 0 1-1.24-4.31c0-4.47 3.64-8.11 8.12-8.11 2.17 0 4.21.85 5.74 2.38a8.07 8.07 0 0 1 2.38 5.73c0 4.47-3.64 8.11-8.12 8.11zm4.45-6.07c-.24-.12-1.44-.71-1.66-.79-.23-.08-.39-.12-.56.12-.17.24-.64.79-.79.95-.14.16-.29.18-.54.06-.24-.12-1.03-.38-1.96-1.21-.72-.64-1.21-1.44-1.35-1.68-.14-.24-.02-.37.1-.49.11-.11.24-.29.37-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.76-1.85-.2-.49-.4-.42-.56-.43h-.47c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.16 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.59.19 1.14.16 1.56.1.48-.07 1.44-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.28z"/>' +
              '</svg>' +
              'Chat on WhatsApp' +
            '</a>' +

            '<a class="btn btn-primary" href="tel:' + encodeURIComponent(p.contactNumber) + '" style="width: 100%; margin-bottom: 0.65rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;">' +
              '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>' +
              '</svg>' +
              'Call Property Owner' +
            '</a>' +

            '<button class="btn btn-secondary" type="button" id="copy-contact" style="width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;">' +
              '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
                '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>' +
                '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' +
              '</svg>' +
              'Copy Contact Number' +
            '</button>' +
            '<div id="copy-msg" class="hidden" style="margin-top: 0.5rem;"></div>' +

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
