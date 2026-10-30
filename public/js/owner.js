(function () {
  const list = document.getElementById("owner-listings");
  const msg = document.getElementById("owner-msg");

  requireUser(["owner"]).then(function (user) {
    if (!user) return;
    load();
  });

  function load() {
    list.innerHTML = '<p class="loading">Loading your property listings…</p>';
    api("/api/properties/mine")
      .then(function (data) {
        if (!data.properties.length) {
          list.innerHTML =
            '<div class="empty">' +
            '<h3>No listings created yet</h3>' +
            '<p class="muted">You have not published any rooms yet. Click "Add New Listing" above to publish your first room.</p>' +
            '<a class="btn btn-primary" href="/owner-form.html">+ Add Your First Listing</a>' +
            '</div>';
          return;
        }

        list.innerHTML =
          '<div class="table-wrap">' +
          '<table>' +
          '<thead>' +
          '<tr>' +
          '<th>Photo</th>' +
          '<th>Title</th>' +
          '<th>Category</th>' +
          '<th>Location</th>' +
          '<th>Monthly Rent</th>' +
          '<th>Status</th>' +
          '<th>Actions</th>' +
          '</tr>' +
          '</thead>' +
          '<tbody>' +
          data.properties
            .map(function (item) {
              const photo =
                item.photos && item.photos.length
                  ? item.photos[0]
                  : "/images/demo/room-single-1.svg";

              let statusBadge = '<span class="badge badge-verified">Live / Published</span>';
              if (item.isRemoved) {
                statusBadge = '<span class="badge badge-removed">Removed by Admin</span>';
              } else if (item.isDemo) {
                statusBadge = '<span class="badge badge-demo">Demo Listing</span>';
              }

              return (
                '<tr>' +
                '<td><img src="' + escapeHtml(photo) + '" width="60" height="42" style="border-radius:4px; object-fit:cover;" onerror="this.src=\'/images/demo/room-single-1.svg\';"></td>' +
                '<td><strong>' + escapeHtml(item.title) + '</strong></td>' +
                '<td><span class="badge">' + escapeHtml(item.typeLabel || item.type) + '</span></td>' +
                '<td>' + escapeHtml(item.locality + ", " + item.city) + '</td>' +
                '<td><strong>' + formatRent(item.monthlyRent) + '</strong></td>' +
                '<td>' + statusBadge + '</td>' +
                '<td>' +
                '<a class="btn btn-ghost btn-sm" href="/listing.html?id=' + encodeURIComponent(item.id) + '" target="_blank">View</a> ' +
                '<a class="btn btn-secondary btn-sm" href="/owner-form.html?id=' + encodeURIComponent(item.id) + '">Edit</a> ' +
                '<button class="btn btn-danger btn-sm" data-del="' + encodeURIComponent(item.id) + '" type="button">Delete</button>' +
                '</td>' +
                '</tr>'
              );
            })
            .join("") +
          '</tbody></table></div>';

        list.querySelectorAll("[data-del]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            const id = btn.getAttribute("data-del");
            if (!confirm("Are you sure you want to permanently delete this listing?")) return;

            api("/api/properties/" + id, { method: "DELETE" })
              .then(function () {
                showMessage(msg, "Listing deleted successfully.", "ok");
                load();
              })
              .catch(function (err) {
                showMessage(msg, err.message, "error");
              });
          });
        });
      })
      .catch(function (err) {
        list.innerHTML = '<p class="alert alert-error">' + escapeHtml(err.message) + '</p>';
      });
  }
})();
