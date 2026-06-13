class HeroCarousel {
  constructor(trackEl, dotsEl, prevBtn, nextBtn) {
    this.track = trackEl;
    this.dotsContainer = dotsEl;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.currentIndex = 0;
    this.slides = [];
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000;
  }

  init(posts) {
    if (!posts.length) {
      this.track.innerHTML = `
        <div class="hero__slide" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#fff5f5,#f0faff);">
          <p style="color:#999;font-size:1.1rem;">記事がまだ投稿されていません</p>
        </div>
      `;
      return;
    }

    const heroPosts = posts.slice(0, 5);

    this.track.innerHTML = heroPosts.map((post) => {
      const category = getCategoryName(post);
      const color = getCategoryColor(category);
      return `
        <div class="hero__slide">
          <a href="article.html?id=${post.id}" class="hero__slide-link">
            <img class="hero__slide-image" src="${getThumbnailUrl(post)}" alt="${post.title || ''}">
            <div class="hero__slide-overlay"></div>
            <div class="hero__slide-content">
              <span class="hero__slide-category" style="background: ${color}">${category}</span>
              <h2 class="hero__slide-title">${post.title || '無題'}</h2>
              <p class="hero__slide-date">${formatDate(post.publishedAt || post.createdAt)}</p>
            </div>
          </a>
        </div>
      `;
    }).join('');

    this.slides = this.track.querySelectorAll('.hero__slide');
    this.renderDots();
    this.bindEvents();
    this.startAutoPlay();
  }

  renderDots() {
    this.dotsContainer.innerHTML = '';
    this.slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = `hero__dot${i === 0 ? ' hero__dot--active' : ''}`;
      dot.setAttribute('aria-label', `スライド ${i + 1}`);
      dot.addEventListener('click', () => this.goTo(i));
      this.dotsContainer.appendChild(dot);
    });
  }

  goTo(index) {
    this.currentIndex = ((index % this.slides.length) + this.slides.length) % this.slides.length;
    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    const dots = this.dotsContainer.querySelectorAll('.hero__dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('hero__dot--active', i === this.currentIndex);
    });
  }

  next() {
    this.goTo(this.currentIndex + 1);
  }

  prev() {
    this.goTo(this.currentIndex - 1);
  }

  bindEvents() {
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => { this.prev(); this.resetAutoPlay(); });
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => { this.next(); this.resetAutoPlay(); });

    let touchStartX = 0;
    this.track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? this.next() : this.prev();
        this.resetAutoPlay();
      }
    });
  }

  startAutoPlay() {
    if (this.slides.length <= 1) return;
    this.autoPlayInterval = setInterval(() => this.next(), this.autoPlayDelay);
  }

  resetAutoPlay() {
    clearInterval(this.autoPlayInterval);
    this.startAutoPlay();
  }
}

window.HeroCarousel = HeroCarousel;
