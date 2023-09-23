import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');

axios.defaults.baseURL = 'https://pixabay.com/api/';
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
);

let query = '';
let page = 1;
let perPage = 40;
let simpleLightbox;

async function fetchCatList(query, page, perPage) {
  return await axios.get(
    `?key=39583334-643e1265d57bd4d698c546928&q=${query}&page=${page}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`
  );
}

function renderCardCatList(images) {
  console.log(images);
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
}

searchForm.addEventListener('submit', handlerSearchImages);

function handlerSearchImages(e) {
  e.preventDefault();
  query = e.currentTarget.elements.searchQuery.value;
  page = 1;
  gallery.innerHTML = '';

  if (query === '') {
    Notify.failure('The search string cannot be empty.');
    return;
  }

  fetchCatList(query, page, perPage)
    .then(resp => {
      if (resp.data.totalHits === 0) {
        Notify.failure(
          'No image matching your search query was found. Please try again.'
        );
      } else {
        renderCardCatList(resp.data.hits);
        simpleLightbox = new SimpleLightbox('.gallery a').refresh();
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

  fetchCatList(query, page, perPage)
    .then(resp => {
      renderCardCatList(resp.data.hits);
      simpleLightbox = new SimpleLightbox('.gallery a').refresh();

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

arrowTop.onclick = function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.addEventListener('scroll', function () {
  arrowTop.hidden = scrollY < document.documentElement.clientHeight;
});
