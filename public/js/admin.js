(function () {
  const stats = document.getElementById("stats");
  const users = document.getElementById("users");
  const listings = document.getElementById("admin-listings");

  requireUser(["admin"]).then(function (user) {
    if (!user) return;
    loadStats();
    loadUsers();
    loadListings();
  });

  function loadStats() {
    api("/api/admin/stats").then(function (data) {
      const s = data.stats;
      stats.innerHTML =
        '<div class="stat"><div class="stat-val">' + s.userCount + '</div><div class="stat-label">Total Users</div></div>' +
        '<div class="stat"><div class="stat-val">' + s.ownerCount + '</div><div class="stat-label">Property Owners</div></div>' +
        '<div class="stat"><div class="stat-val">' + s.listingCount + '</div><div class="stat-label">Active Listings</div></div>' +
        '<div class="stat"><div class="stat-val">' + s.removedCount + '</div><div class="stat-label">Moderated Listings</div></div>';
    });
  }

  function loadUsers() {
    api("/api/admin/users").then(function (data) {
      if (!data.users.length) {
        users.innerHTML = '<div class="empty">No registered user accounts found.</div>';
        return;
      }
      users.innerHTML =
        '<div class="table-wrap"><table>' +
        '<thead>' +
        '<tr>' +
        '<th>User Name</th>' +
        '<th>Email</th>' +
        '<th>Role</th>' +
        '<th>Verified</th>' +
        '<th>Status</th>' +
        '<th>Action</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>' +
        data.users
          .map(function (u) {
            const actionText = u.isActive ? "Deactivate" : "Reactivate";
            const btnClass = u.isActive ? "btn-danger" : "btn-primary";
            const roleBadge = '<span class="badge">' + escapeHtml(u.role) + '</span>';
            const verifiedBadge = u.isVerified
              ? '<span class="badge badge-verified">✓ Yes</span>'
              : '<span class="badge" style="background:#fee2e2;color:#991b1b;">Pending</span>';
            const statusBadge = u.isActive
              ? '<span style="color:var(--ok);font-weight:600;">Active</span>'
              : '<span style="color:var(--danger);font-weight:600;">Deactivated</span>';

            return (
              '<tr>' +
              '<td><strong>' + escapeHtml(u.name) + '</strong></td>' +
              '<td>' + escapeHtml(u.email) + '</td>' +
              '<td>' + roleBadge + '</td>' +
              '<td>' + verifiedBadge + '</td>' +
              '<td>' + statusBadge + '</td>' +
              '<td>' +
              '<button class="btn ' + btnClass + ' btn-sm" data-user="' + escapeHtml(u.id) + '" data-active="' + (!u.isActive) + '" type="button">' +
              actionText +
              '</button>' +
              '</td>' +
              '</tr>'
            );
          })
          .join("") +
        '</tbody></table></div>';

      users.querySelectorAll("[data-user]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const userId = btn.getAttribute("data-user");
          const nextActive = btn.getAttribute("data-active") === "true";
          api("/api/admin/users/" + userId + "/active", {
            method: "PATCH",
            body: { isActive: nextActive }
          }).then(function () {
            loadUsers();
            loadStats();
          });
        });
      });
    });
  }

  function loadListings() {
    api("/api/admin/listings").then(function (data) {
      if (!data.properties.length) {
        listings.innerHTML = '<div class="empty">No property listings found in the database.</div>';
        return;
      }

      listings.innerHTML =
        '<div class="table-wrap"><table>' +
        '<thead>' +
        '<tr>' +
        '<th>Photo</th>' +
        '<th>Title</th>' +
        '<th>Owner</th>' +
        '<th>Location</th>' +
        '<th>Rent</th>' +
        '<th>Status</th>' +
        '<th>Moderation Actions</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>' +
        data.properties
          .map(function (p) {
            const photo =
              p.photos && p.photos.length
                ? p.photos[0]
                : "/images/demo/room-single-1.svg";

            let statusBadge = '<span class="badge badge-verified">Active</span>';
            if (p.isRemoved) {
              statusBadge = '<span class="badge badge-removed">Removed</span>';
            } else if (p.isDemo) {
              statusBadge = '<span class="badge badge-demo">Demo</span>';
            }

            const toggleBtn = p.isRemoved
              ? '<button class="btn btn-secondary btn-sm" data-restore="' + escapeHtml(p.id) + '" type="button">Restore</button>'
              : '<button class="btn btn-danger btn-sm" data-remove="' + escapeHtml(p.id) + '" type="button">Take Down</button>';

            return (
              '<tr>' +
              '<td><img src="' + escapeHtml(photo) + '" width="60" height="42" style="border-radius:4px;object-fit:cover;" onerror="this.src=\'/images/demo/room-single-1.svg\';"></td>' +
              '<td><strong>' + escapeHtml(p.title) + '</strong></td>' +
              '<td><small>' + escapeHtml((p.ownerName || "") + " (" + (p.ownerEmail || "") + ")") + '</small></td>' +
              '<td>' + escapeHtml(p.locality + ", " + p.city) + '</td>' +
              '<td>' + formatRent(p.monthlyRent) + '</td>' +
              '<td>' + statusBadge + '</td>' +
              '<td>' +
              '<a class="btn btn-ghost btn-sm" href="/listing.html?id=' + encodeURIComponent(p.id) + '" target="_blank">View</a> ' +
              toggleBtn + ' ' +
              '<button class="btn btn-ghost btn-sm" style="color:var(--danger);" data-destroy="' + escapeHtml(p.id) + '" type="button">Delete</button>' +
              '</td>' +
              '</tr>'
            );
          })
          .join("") +
        '</tbody></table></div>';

      listings.querySelectorAll("[data-remove]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const reason = prompt("Enter moderation reason for removing this listing:", "Inappropriate or inaccurate content");
          if (!reason) return;
          api("/api/admin/listings/" + btn.getAttribute("data-remove") + "/remove", {
            method: "POST",
            body: { reason: reason }
          }).then(function () {
            loadListings();
            loadStats();
          });
        });
      });

      listings.querySelectorAll("[data-restore]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          api("/api/admin/listings/" + btn.getAttribute("data-restore") + "/restore", {
            method: "POST",
            body: {}
          }).then(function () {
            loadListings();
            loadStats();
          });
        });
      });

      listings.querySelectorAll("[data-destroy]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (!confirm("Are you sure you want to permanently destroy this listing and delete its files?")) return;
          api("/api/admin/listings/" + btn.getAttribute("data-destroy"), {
            method: "DELETE"
          }).then(function () {
            loadListings();
            loadStats();
          });
        });
      });
    });
  }
})();
