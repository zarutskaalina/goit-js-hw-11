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

function renderCardList(images) {
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

      return `
      <a class="gallery_link link" href="${largeImageURL}">
      <img class="gallery_image" src="${webformatURL}" alt="${tags}" width="300" loading="lazy" />
  
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
    </div>
    </a>`;
    })
    .join('');

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
        renderCardList(resp.data.hits);

        simpleLightbox = new SimpleLightbox('.gallery a', {
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
      renderCardList(resp.data.hits);

      const totalPages = Math.ceil(resp.data.totalHits / perPage);

      if (totalPages <= page) {
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }

      simpleLightbox = new SimpleLightbox('.gallery a', {
        captionData: 'alt',
        captionDelay: '250',
      }).refresh();
    })
    .catch(error => console.log(error));
}

const arrowTop = document.getElementById('arrowTop');

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
