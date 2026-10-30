const STARTUP_FRAME_COUNT = 36;
const MINIMUM_DISPLAY_MS = 2200;
const EXIT_DURATION_MS = 850;

const frameUrls = Array.from(
  { length: STARTUP_FRAME_COUNT },
  (_, index) => `/hero-frames/ezgif-frame-${String(index + 1).padStart(3, '0')}.webp`,
);

let activePreloader = null;

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

function waitForPageLoad() {
  if (document.readyState === 'complete') return Promise.resolve();

  return new Promise((resolve) => {
    window.addEventListener('load', resolve, { once: true });
  });
}

function preloadFrames(onProgress) {
  let settled = 0;

  return Promise.all(
    frameUrls.map(
      (src) =>
        new Promise((resolve) => {
          const image = new Image();
          const finish = () => {
            settled += 1;
            onProgress(settled / frameUrls.length);
            resolve();
          };

          image.onload = finish;
          image.onerror = finish;
          image.src = src;
        }),
    ),
  );
}

function createMarkup() {
  const preloader = document.createElement('div');
  preloader.className = 'preloader';
  preloader.setAttribute('role', 'status');
  preloader.setAttribute('aria-live', 'polite');
  preloader.setAttribute('aria-label', 'Loading St. Jacobs Hotel');

  preloader.innerHTML = `
    <div class="preloader__glow" aria-hidden="true"></div>
    <div class="preloader__lockup">
      <div class="preloader__logo-frame">
        <span class="preloader__halo" aria-hidden="true"></span>
        <img class="preloader__logo" src="/logo-foreground.png" alt="St. Jacobs Hotel crest">
        <span class="preloader__shine" aria-hidden="true"></span>
      </div>
    </div>
    <span class="visually-hidden preloader__status">Loading hotel experience</span>
  `;

  return preloader;
}

function lockPage() {
  document.documentElement.classList.add('preloader-pending');
  document.body.classList.add('is-preloading');

  const main = document.querySelector('main');
  if (main) main.inert = true;

  window.lenis?.stop?.();
}

function unlockPage() {
  document.documentElement.classList.remove('preloader-pending');
  document.body.classList.remove('is-preloading');

  const main = document.querySelector('main');
  if (main) main.inert = false;

  window.lenis?.start?.();
}

async function runPreloader({ compact = false } = {}) {
  activePreloader?.remove();
  lockPage();

  const preloader = createMarkup();
  const status = preloader.querySelector('.preloader__status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const minimumDuration = compact ? 1200 : MINIMUM_DISPLAY_MS;
  const startedAt = Date.now();

  activePreloader = preloader;
  document.body.prepend(preloader);

  const updateProgress = (progress) => {
    const value = Math.round(progress * 100);
    status.textContent = value === 100 ? 'Hotel experience ready' : 'Loading hotel experience';
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(() => preloader.classList.add('is-entered'));
  });

  await Promise.all([preloadFrames(updateProgress), waitForPageLoad()]);
  updateProgress(1);

  const elapsed = Date.now() - startedAt;
  await wait(Math.max(0, (reducedMotion ? 450 : minimumDuration) - elapsed));

  preloader.classList.add('is-ready');
  await wait(reducedMotion ? 80 : 180);
  preloader.classList.add('is-exiting');
  await wait(reducedMotion ? 260 : EXIT_DURATION_MS);

  preloader.remove();
  if (activePreloader === preloader) activePreloader = null;
  unlockPage();
}

export function installPreloader(options = {}) {
  if (window.stJacobsPreloader?.installed) return window.stJacobsPreloader.promise;

  const controller = {
    installed: true,
    promise: runPreloader(options),
    replay: () => runPreloader(options),
  };

  window.stJacobsPreloader = controller;

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) controller.promise = controller.replay();
  });

  return controller.promise;
}
