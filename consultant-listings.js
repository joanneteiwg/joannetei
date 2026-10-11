(function () {
  const listings = Array.isArray(window.IPROPERTY_LISTINGS) ? window.IPROPERTY_LISTINGS : [];
  const pageSize = 9;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  document.querySelectorAll('[data-synced-listing-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.listing-track');
    const controls = carousel.parentElement.querySelector('.listing-controls');
    const previous = controls.querySelector('[data-listing-prev]');
    const next = controls.querySelector('[data-listing-next]');
    const counter = controls.querySelector('.listing-page-number');
    const pageCount = Math.max(1, Math.ceil(listings.length / pageSize));

    track.replaceChildren();
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      const page = document.createElement('div');
      page.className = 'listing-page';
      listings.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).forEach((listing) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.innerHTML = `<article class="project">
          <img src="${escapeHtml(listing.image)}" alt="${escapeHtml(listing.title)}" loading="lazy" onerror="this.onerror=null;this.src='../assets/futuristic-property-hero.jpg'">
          <div class="project-body">
            <div class="meta">${listing.type === 'rent' ? 'Rent' : 'Sale'} ${escapeHtml(listing.price)}</div>
            <h3>${escapeHtml(listing.title)}</h3>
            <p>${escapeHtml(listing.details)}</p>
            <div class="property-specs"><div class="property-spec">Property type<strong>${escapeHtml(listing.propertyType)}</strong></div></div>
            <a class="btn" href="${escapeHtml(listing.url)}" target="_blank" rel="noopener">View active listing</a>
          </div>
        </article>`;
        page.appendChild(slide);
      });
      track.appendChild(page);
    }

    let current = 0;
    const showPage = () => {
      track.style.transform = `translateX(-${current * 100}%)`;
      counter.textContent = `${current + 1} / ${pageCount}`;
      previous.disabled = current === 0;
      next.disabled = current >= pageCount - 1;
    };
    previous.addEventListener('click', () => { if (current > 0) { current -= 1; showPage(); } });
    next.addEventListener('click', () => { if (current < pageCount - 1) { current += 1; showPage(); } });
    showPage();
  });

  const saleCount = listings.filter((listing) => listing.type === 'sale').length;
  const rentCount = listings.filter((listing) => listing.type === 'rent').length;
  document.querySelectorAll('[data-listing-sync-note]').forEach((note) => {
    note.innerHTML = `<strong>${listings.length} active iProperty listings</strong> — ${saleCount} for sale and ${rentCount} for rent. <a href="/listings.html" style="color:var(--lime)">View the full live portfolio &#8599;</a>`;
  });
}());
