import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return Promise.reject(error);
  }
);

export async function fetchImagesList(query, page, perPage) {
  return await axios.get(
    `?key=39583334-643e1265d57bd4d698c546928&q=${query}&page=${page}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`
  );
}
