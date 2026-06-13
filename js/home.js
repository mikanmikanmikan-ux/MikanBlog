document.addEventListener('DOMContentLoaded', async () => {
  const blogCards = document.getElementById('blog-cards');
  const heroTrack = document.getElementById('hero-track');
  const heroDots = document.getElementById('hero-dots');
  const heroPrev = document.getElementById('hero-prev');
  const heroNext = document.getElementById('hero-next');

  renderLoading(blogCards);

  try {
    const data = await fetchBlogPosts({ limit: 100 });
    const posts = data.contents || [];

    const carousel = new HeroCarousel(heroTrack, heroDots, heroPrev, heroNext);
    carousel.init(posts);

    blogCards.innerHTML = '';
    if (posts.length === 0) {
      renderEmpty(blogCards);
      return;
    }

    const displayPosts = posts.slice(0, 6);
    displayPosts.forEach((post) => {
      blogCards.appendChild(createCard(post));
    });
  } catch (error) {
    renderError(blogCards, error.message, () => location.reload());

    const carousel = new HeroCarousel(heroTrack, heroDots, heroPrev, heroNext);
    carousel.init([]);
  }
});
