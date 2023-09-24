import { fetchImagesList } from './fetch-images-list';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');

let query = '';
let page = 1;
let perPage = 40;
let simpleLightbox;

function renderCardCatList(images) {
  if (!gallery) {
    return;
  }

  const markup = images
    .map(image => {
      const {
        id,
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = image;

      return `<div class="photo-card">
      <ul class="gallery_list list">
      <li class="gallery_item">
      <a class="gallery_link link" href="${largeImageURL}">
      <img class="gallery_image" src="${webformatURL}" alt="${tags}" width="300" loading="lazy" />
      </a>
      
    <div class="info">
      <p class="info-item">
        <b>Likes:</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views:</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments:</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads:</b>
        ${downloads}
      </p>
    </div>
    </li>
      </ul>
  </div>`;
    })
    .join();

  gallery.insertAdjacentHTML('beforeend', markup);

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

searchForm.addEventListener('submit', handlerSearchImages);

function handlerSearchImages(e) {
  e.preventDefault();
  query = e.currentTarget.elements.searchQuery.value.trim();
  page = 1;
  gallery.innerHTML = '';

  if (query === '') {
    Notify.failure('The search string cannot be empty.');
    return;
  }

  fetchImagesList(query, page, perPage)
    .then(resp => {
      if (resp.data.totalHits === 0) {
        Notify.failure(
          'No image matching your search query was found. Please try again.'
        );
      } else {
        renderCardCatList(resp.data.hits);

        simpleLightbox = new SimpleLightbox('.gallery_item a', {
          captionData: 'alt',
          captionDelay: '250',
        }).refresh();
        Notify.success(`Hooray! We found ${resp.data.totalHits} images.`);
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      searchForm.reset();
    });
}

function handlerLoadMore() {
  page += 1;
  simpleLightbox.destroy();

  fetchImagesList(query, page, perPage)
    .then(resp => {
      renderCardCatList(resp.data.hits);

      simpleLightbox = new SimpleLightbox('.gallery_item a', {
        captionData: 'alt',
        captionDelay: '250',
      }).refresh();

      const totalPages = Math.ceil(resp.data.totalHits / perPage);

      if (page > totalPages) {
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(error => console.log(error));
}

function checkIfEndOfPage() {
  return (
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight
  );
}

function showLoadMorePage() {
  if (checkIfEndOfPage()) {
    handlerLoadMore();
  }
}

window.addEventListener('scroll', showLoadMorePage);

arrowTop.onclick = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.addEventListener('scroll', () => {
  arrowTop.hidden = scrollY < document.documentElement.clientHeight;
});
