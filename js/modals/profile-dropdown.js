// ===============================
// profile-dropdown.js
// ===============================

fetch("../api/auth_check.php")
    .then(res => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
    })
    .then(user => {
        // Decide which dropdown HTML to load BASED ON ROLE
        let htmlPath;

        switch (user.role.toLowerCase()) {
            case "admin":
                htmlPath = "../components/modals/admin/profile-dropdown.html";
                break;
            case "optometrist":
                htmlPath = "../components/modals/optometrist/profile-dropdown.html";
                break;
            case "manager":
                htmlPath = "../components/modals/manager/profile-dropdown.html";
                break;
            default:
                htmlPath = "../components/modals/profile-dropdown.html";
        }

        // Load dropdown HTML
        return fetch(htmlPath)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load profile dropdown");
                return res.text();
            })
            .then(html => {
                document.getElementById("profile-dropdown-placeholder").innerHTML = html;

                setupProfileDropdown(user);
            });
    })
    .catch(err => {
        console.error("Profile dropdown error:", err);
        window.location.href = "login.html";
    });


// ===============================
// SETUP DROPDOWN LOGIC
// ===============================
function setupProfileDropdown(user) {
    const profileModal = document.getElementById("profileModal");
    const profileButton = document.querySelector(".icon-button.profile");

    if (!profileModal || !profileButton) {
        console.error("Profile dropdown elements not found");
        return;
    }

    // Set user info
    const nameEl = profileModal.querySelector(".profile-name");
    const roleEl = profileModal.querySelector(".profile-role");

    if (nameEl) {
        nameEl.textContent = `${user.firstname} ${user.lastname}`;
    }
    if (roleEl) {
        roleEl.textContent = user.role;
    }

    // Toggle dropdown
    profileButton.addEventListener("click", e => {
        e.stopPropagation();
        profileModal.classList.toggle("active");
    });

    // Close when clicking outside
    document.addEventListener("click", e => {
        if (
            profileModal.classList.contains("active") &&
            !profileModal.contains(e.target) &&
            !profileButton.contains(e.target)
        ) {
            profileModal.classList.remove("active");
        }
    });

    // Close on ESC
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            profileModal.classList.remove("active");
        }
    });

    // Menu item actions
    profileModal.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", e => {
            e.preventDefault();

            if (item.classList.contains("logout")) {
                // REAL LOGOUT (DESTROYS SESSION)
                window.location.href = "../api/logout.php";
                return;
            }

            const text = item.querySelector(".menu-text")?.textContent.trim();
            handleMenuNavigation(text);

            profileModal.classList.remove("active");
        });
    });
}


// ===============================
// MENU NAVIGATION HANDLER
// ===============================
function handleMenuNavigation(menuText) {
    const actions = {
        "Basic Information": () => console.log("Go to Basic Information"),
        "My Profile": () => console.log("Go to My Profile"),
        "Settings": () => console.log("Go to Settings"),
        "Notifications": () => console.log("Go to Notifications"),
        "Privacy & Security": () => console.log("Go to Privacy & Security"),
        "Help & Support": () => console.log("Go to Help & Support")
    };

    if (actions[menuText]) {
        actions[menuText]();
    } else {
        console.warn("No action defined for:", menuText);
    }
}
