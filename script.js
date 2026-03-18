const branchLinks = Array.from(document.querySelectorAll(".branch-link"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
const progressBar = document.querySelector(".scroll-progress__value");
const nav = document.querySelector(".branch-nav");

const sectionMap = new Map(branchLinks.map((link) => [link.dataset.target, link]));

const usesStickyNav = () => {
  if (!nav) {
    return false;
  }

  const navPosition = window.getComputedStyle(nav).position;
  return navPosition === "sticky" || navPosition === "fixed";
};

const setActiveLink = (id) => {
  branchLinks.forEach((link) => {
    const isActive = link.dataset.target === id;

    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }

  });
};

const getScrollTarget = (section) => {
  const navHeight = usesStickyNav() && nav ? nav.offsetHeight : 0;
  const offset = 24;
  return section.getBoundingClientRect().top + window.scrollY - navHeight - offset;
};

branchLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.dataset.target;
    const section = document.getElementById(targetId);

    if (!section) {
      return;
    }

    event.preventDefault();
    setActiveLink(targetId);
    window.scrollTo({
      top: getScrollTarget(section),
      behavior: "smooth",
    });
  });
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visibleEntry) {
      return;
    }

    const link = sectionMap.get(visibleEntry.target.id);
    if (link) {
      setActiveLink(link.dataset.target);
    }
  },
  {
    threshold: [0.2, 0.35, 0.55],
    rootMargin: "-22% 0px -48% 0px",
  }
);

sections.forEach((section) => {
  sectionObserver.observe(section);
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -6% 0px",
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 35, 240)}ms`;
  revealObserver.observe(item);
});

const updateProgress = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

  if (progressBar) {
    progressBar.style.transform = `scaleX(${progress})`;
  }

  document.body.classList.toggle("is-scrolled", window.scrollY > 30);
};

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
window.addEventListener("load", updateProgress);

if (window.location.hash) {
  const initialTarget = document.getElementById(window.location.hash.slice(1));
  if (initialTarget) {
    requestAnimationFrame(() => {
      window.scrollTo(0, getScrollTarget(initialTarget));
      setActiveLink(initialTarget.id);
    });
  }
}

if (!window.location.hash) {
  setActiveLink("vvedenie");
}
updateProgress();
