document.addEventListener("DOMContentLoaded", function() {
  const moreBtn = document.querySelector(".nav-link-dropdown");
  const mega = document.querySelector(".mega-menu");

  let open = false;

  moreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    open = !open;
    mega.classList.toggle("open", open);
  });

  // Close when clicking outside
  document.addEventListener("click", () => {
    if (open) {
      open = false;
      mega.classList.remove("open");
    }
  });

  // Prevent click inside mega-menu from closing it
  mega.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});