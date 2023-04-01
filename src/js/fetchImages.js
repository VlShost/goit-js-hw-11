import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';
// axios.defaults.headers.common['Authorization'] = '34825153-ab3ec4a7983bb4a4e3513dccc';

export async function fetchImages(query, page, perPage) {
  const res = await axios.get(
    `?key=34825153-ab3ec4a7983bb4a4e3513dccc&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
  );
  return res.data;
}