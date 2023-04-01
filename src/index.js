import './css/styles.css';
import { fetchImages } from "./js/fetchImages";
import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more')
}

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMore.addEventListener('click', onLoadMore);

const perPage = 40;
let query = '';
let page = 1;
let currentHits = 0;
const lightbox = new SimpleLightbox('.gallery a', {
  captionPosition: 'bottom',
  captionsData: 'alt',
  captionDelay: 250,
});

async function onSearch(e) {
  e.preventDefault();
  query = e.currentTarget.searchQuery.value.trim();
  pageReset();
  refs.loadMore.classList.add('is-hidden');

  if (!query) {
    alertEmptyForm();
    return;
  }
  e.currentTarget.reset();

  const res = await fetchImages(query, page, perPage)
  currentHits = res.hits.length;
  if (res.totalHits > 40) {
    refs.loadMore.classList.remove('is-hidden');
  } else {
    refs.loadMore.classList.add('is-hidden');
  }

  try {
    if (res.totalHits > 0) {
      alertSuccess(res);
      clearGallery();
      renderGallery(res);
      lightbox.refresh();
    }

    if (res.totalHits === 0) {
      clearGallery();
      alertSearchFailure();
      refs.loadMore.classList.add('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMore() {
  page += 1;
  const res = await fetchImages(query, page, perPage);
  renderGallery(res);
  lightbox.refresh();
  console.log(res.hits);
  currentHits += res.hits.length;

  if (currentHits >= res.totalHits) {
    refs.loadMore.classList.add('is-hidden');
    alertEndOfContent();
  };
  smoothScroll();
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 3,
    behavior: 'smooth',
  });
}

function renderGallery(images) {
  const markup = images.hits
    .map(({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads
    }) => {
      return `<div class="photo-card">
        <a class="gallery-item" href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>Likes</b>${likes}
          </p>
          <p class="info-item">
            <b>Views</b>${views}
          </p>
          <p class="info-item">
            <b>Comments</b>${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>${downloads}
          </p>
        </div>
      </div>`;
    })
    .join('');

  refs.gallery.insertAdjacentHTML(`beforeend`, markup);
  lightbox.refresh();
}

function pageReset() {
  page = 1;
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function alertSuccess(res) {
  Notiflix.Notify.success(`Hooray! We found ${res.totalHits} images.`);
}

function alertEmptyForm() {
  Notiflix.Notify.failure('The search string cannot be empty. Please specify your search query.');
}

function alertSearchFailure() {
  Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
}

function alertEndOfContent() {
  Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
}
