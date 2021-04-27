const express = require('express');
const cors = require('cors');
const axios = require('axios').default;
const util = require('./util')
const config = require('./config')

const app = express();
app.use(cors());
axios.defaults.baseURL = config.BASE_URL;

app.get('/', (req, res) => {
    res.send({
      message: 'Welcome to USC Films!'
    });
})

//4.1.1 Multi-Search Endpoint to search for both Movies and TV shows (7)
//@3.1.1 Search Functionality
app.get('/api/v1/search/:name', async (req, res) => {
  const searchParam = req.params.name;
  const fetchSearchResults = async () => {
    try {
      const response = await axios.get(`/search/multi?api_key=${config.API_KEY}&language=enUS&query=${searchParam}`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchSearchResults();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result) => {
      if(util.isValidProperty(result, 'media_type') && util.isValidProperty(result, 'backdrop_path')) {
        switch(result.media_type){
          case 'movie':
            data.push({
              id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
              name:  util.isValidProperty(result, 'title') ? result.title : "",
              backdrop_path:  util.isValidProperty(result, 'backdrop_path') ? `${config.IMAGE_PATH_W500}${result.backdrop_path}` : "",
              media_type: 'movie'
            })
            return;
          case 'tv':
            data.push({
              id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
              name:  util.isValidProperty(result, 'name') ? result.name : "",
              backdrop_path:  util.isValidProperty(result, 'backdrop_path') ? `${config.IMAGE_PATH_W500}${result.backdrop_path}` : "",
              media_type: 'tv'
            })
            return;
          default:
            return;
        }
      }
    })
  }
  data = data.slice(0, 7)
  res.send({data: data});
  res.end();
})

//4.1.2 Trending Movies Endpoint (20 => 6)
//@3.2.5 Trending Movies Section
app.get('/api/v1/movies/trending', async (req, res) => {
  const fetchTrendingMovies = async () => {
    try {
      const response = await axios.get(`trending/movie/day?api_key=${config.API_KEY}`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchTrendingMovies();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result) => {
      if(util.isValidProperty(result, 'poster_path')){
        data.push({
          id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
          title:  util.isValidProperty(result, 'title') ? result.title : "",
          poster_path:  `${config.IMAGE_PATH_W500}${result.poster_path}`,
          media_type: 'movie'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.3 Top-Rated Movies Endpoint (20 => 6)
//@3.2.4 Top Rated Movies Section
app.get('/api/v1/movies/top-rated', async (req, res) => {
  const fetchTopRatedMovies = async () => {
    try {
      const response = await axios.get(`movie/top_rated?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchTopRatedMovies();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result) => { 
      if(util.isValidProperty(result, 'poster_path')){
        data.push({
          id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
          title:  util.isValidProperty(result, 'title') ? result.title : "",
          poster_path:  `${config.IMAGE_PATH_W500}${result.poster_path}`,
          media_type: 'movie'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.4 Currently playing Movies Endpoint (5)
//@3.2.1 Currently Playing Movies Carousel
app.get('/api/v1/movies/currently-playing', async (req, res) => {
  const fetchCurrentPlayingMovies = async () => {
    try {
      const response = await axios.get(`movie/now_playing?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchCurrentPlayingMovies();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result, i) => {
      if(i < 5){
        data.push({
          id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
          title:  util.isValidProperty(result, 'title') ? result.title : "",
          poster_path:  util.isValidProperty(result, 'poster_path') ? `${config.IMAGE_PATH_ORIGINAL}${result.backdrop_path}` : "",
          media_type: 'movie'
        })
      }
    })
  }
  res.send(({data: data, count: data.length}));
  res.end();
})

//4.1.5 Popular Movies Endpoint (20 => 6)
//@3.2.3 Popular Movies Section
app.get('/api/v1/movies/popular', async (req, res) => {
  const fetchPopularMovies = async () => {
    try {
      const response = await axios.get(`/movie/popular?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchPopularMovies();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result) => {
      if(util.isValidProperty(result, 'poster_path')){
        data.push({
          id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
          title:  util.isValidProperty(result, 'title') ? result.title : "",
          poster_path:  `${config.IMAGE_PATH_W500}${result.poster_path}`,
          media_type: 'movie'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.6 Recommended Movies Endpoint (20 => 6)
app.get('/api/v1/movie/:id/recommended', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchRecommendedMovies = async () => {
    try {
      const response = await axios.get(`/movie/${id}/recommendations?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchRecommendedMovies();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result) => {
      if(util.isValidProperty(result, 'poster_path')){
        data.push({
          id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
          title:  util.isValidProperty(result, 'title') ? result.title : "",
          poster_path:  `${config.IMAGE_PATH_W500}${result.poster_path}`,
          media_type: 'movie'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.7 Similar Movies Endpoint (20 => 6)
app.get('/api/v1/movie/:id/similar', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchSimilarMovies = async () => {
    try {
      const response = await axios.get(`/movie/${id}/similar?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchSimilarMovies();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result) => {
      if(util.isValidProperty(result, 'poster_path')){
        data.push({
          id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
          title:  util.isValidProperty(result, 'title') ? result.title : "",
          poster_path:  `${config.IMAGE_PATH_W500}${result.poster_path}`,
          media_type: 'movie'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.8 Movie Video Endpoint (1^)
app.get('/api/v1/movie/:id/video', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchMovieVideo = async () => {
    try {
      const response = await axios.get(`/movie/${id}/videos?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchMovieVideo();
  let data = [];
  if(rawData.results != null) {
    const trailers = rawData.results.filter(result => {
      if(util.isValidProperty(result, 'type')){
        return result.type.toLowerCase() === 'trailer';
      }
    })
    trailers.forEach((result) => {
      if(util.isValidProperty(result, 'site') && 
      util.isValidProperty(result, 'type') && 
      util.isValidProperty(result, 'name')
      ){
        data.push({
          site:  result.site,
          type:  result.type,
          name:  result.name,
          key:  util.isValidProperty(result, 'key') ? result.key : config.DEFAULT_VIDEO_ID,
          title:  util.isValidProperty(rawData, 'title') ? rawData.title : "",
          media_type: 'movie'
        })
      }
      
    })
  }
  data.push(
    {
      site:  "YouTube",
      type:  "Trailer",
      name:  `Trailer of ${id}`,
      key:  config.DEFAULT_VIDEO_ID,
      title:  util.isValidProperty(rawData, 'title') ? rawData.title : "",
      media_type: 'movie'
    }
  )
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.9 Movie Details Endpoint (object)
//@3.3.1 Details of Searched Movie/ TV show
app.get('/api/v1/movie/:id/details', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchMovieDetails = async () => {
    try {
      const response = await axios.get(`/movie/${id}?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchMovieDetails();
  let data = {};
  if(rawData != null){
    data = {
      title:  util.isValidProperty(rawData, 'title') ? rawData.title : "",
      genres:  util.isValidProperty(rawData, 'genres', 'array') ? rawData.genres : "",
      spoken_languages:  util.isValidProperty(rawData, 'spoken_languages', 'array') ? rawData.spoken_languages : "",
      release_date:  util.isValidProperty(rawData, 'release_date') ? rawData.release_date : "",
      runtime:  util.isValidProperty(rawData, 'runtime', 'number') ? rawData.runtime : "",
      overview:  util.isValidProperty(rawData, 'overview') ? rawData.overview : "",
      vote_average:  util.isValidProperty(rawData, 'vote_average', 'number') ? rawData.vote_average : "",
      tagline:  util.isValidProperty(rawData, 'tagline') ? rawData.tagline : "",
      id: id,
      poster_path:  util.isValidProperty(rawData, 'poster_path') ? `${config.IMAGE_PATH_W500}${rawData.poster_path}` : "",
      media_type: 'movie',
    }
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.10 Movie Reviews Endpoint: (10): WIP
app.get('/api/v1/movie/:id/reviews', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchMovieReviews = async () => {
    try {
      const response = await axios.get(`/movie/${id}/reviews?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchMovieReviews();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result, i) => {
      if(i < 10){
        data.push({
          author:  util.isValidProperty(result, 'author') ? result.author : "",
          content:  util.isValidProperty(result, 'content') ? result.content : "",
          created_at:  util.isValidProperty(result, 'created_at') ? result.created_at : "",
          url:  util.isValidProperty(result, 'url') ? result.url : "",
          rating:  util.isValidProperty(result.author_details, 'rating', 'number') ? result.author_details.rating : 0,
          avatar_path:  util.isValidProperty(result.author_details, 'avatar_path') ? 
            (result.author_details.avatar_path.startsWith("/https") ? result.author_details.avatar_path.substring(1) : `${config.IMAGE_PATH_ORIGINAL}${result.author_details.avatar_path}`) : 
              null,
          media_type: 'movie'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.11 Movie Casts Endpoint (0^): WIP
app.get('/api/v1/movie/:id/casts', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchMovieCasts = async () => {
    try {
      const response = await axios.get(`/movie/${id}/credits?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchMovieCasts();
  let data = [];
  if(rawData.cast != null && Array.isArray(rawData.cast)){
    rawData.cast.forEach((result) => {
      if(util.isValidProperty(result, 'profile_path')){
        data.push({
          id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
          name:  util.isValidProperty(result, 'name') ? result.name : "",
          character:  util.isValidProperty(result, 'character') ? result.character : "",
          profile_path:  util.isValidProperty(result, 'profile_path') ? `${config.IMAGE_PATH_W500}${result.profile_path}` : "",
          media_type: 'movie'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.12 Trending TV Shows Endpoint
//@3.2.8 Trending TV shows Section (20 => 6)
app.get('/api/v1/tvs/trending', async (req, res) => {
  const fetchTrendingTVShows = async () => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/trending/tv/day?api_key=${config.API_KEY}`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchTrendingTVShows();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result) => {
      if(util.isValidProperty(result, 'poster_path')){
        data.push({
          id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
          name:  util.isValidProperty(result, 'name') ? result.name : "",
          poster_path:  `${config.IMAGE_PATH_W500}${result.poster_path}`,
          media_type: 'tv'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.13 Top-Rated TV shows Endpoint
//@3.2.7 Top Rated TV Shows Section (20 => 6)
app.get('/api/v1/tvs/top-rated', async (req, res) => {
  const fetchPopularTVShows = async () => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/tv/top_rated?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchPopularTVShows();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result) => {
      if(util.isValidProperty(result, 'poster_path')){
        data.push({
          id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
          name:  util.isValidProperty(result, 'name') ? result.name : "",
          poster_path:  `${config.IMAGE_PATH_W500}${result.poster_path}`,
          media_type: 'tv'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.14 Popular TV shows Endpoint
//@3.2.6 Popular TV Shows Section (20 => 6)
app.get('/api/v1/tvs/popular', async (req, res) => {
  const fetchPopularMovies = async () => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchPopularMovies();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result) => {
      if(util.isValidProperty(result, 'poster_path')){
        data.push({
          id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
          name:  util.isValidProperty(result, 'name') ? result.name : "",
          poster_path:  `${config.IMAGE_PATH_W500}${result.poster_path}`,
          media_type: 'tv'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.15 Recommended TV shows Endpoint (20 => 6)
app.get('/api/v1/tv/:id/recommended', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchRecommendedTVShows = async () => {
    try {
      const response = await axios.get(`/tv/${id}/recommendations?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchRecommendedTVShows();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result) => {
      if(util.isValidProperty(result, 'poster_path')){
        data.push({
          id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
          name:  util.isValidProperty(result, 'name') ? result.name : "",
          poster_path:  `${config.IMAGE_PATH_W500}${result.poster_path}`,
          media_type: 'tv'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.16 Similar TV shows Endpoint (20 => 6)
app.get('/api/v1/tv/:id/similar', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchSimilarTVShows = async () => {
    try {
      const response = await axios.get(`/tv/${id}/similar?api_key=${config.API_KEY}&language=en-US&page=11`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchSimilarTVShows();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result) => {
      if(util.isValidProperty(result, 'poster_path')){
        data.push({
          id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
          name:  util.isValidProperty(result, 'name') ? result.name : "",
          poster_path:  `${config.IMAGE_PATH_W500}${result.poster_path}`,
          media_type: 'tv'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.17 TV show Video Endpoint (1^)
app.get('/api/v1/tv/:id/video', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchTVShowVideo = async () => {
    try {
      const response = await axios.get(`tv/${id}/videos?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchTVShowVideo();
  let data = [];
  if(rawData.results != null) {
    const trailers = rawData.results.filter(result => {
      if(util.isValidProperty(result, 'type')){
        return result.type.toLowerCase() === 'trailer';
      }
    })
    trailers.forEach((result) => {
      if(util.isValidProperty(result, 'site') && 
      util.isValidProperty(result, 'type') && 
      util.isValidProperty(result, 'name')
      ){
        data.push({
          site:  result.site,
          type:  result.type,
          name:  result.name,
          key:  util.isValidProperty(result, 'key') ? result.key : config.DEFAULT_VIDEO_ID,
          title:  util.isValidProperty(rawData, 'name') ? rawData.name : "",
          media_type: 'tv'
        })
      }
      
    })
  }
  data.push(
    {
      site:  "YouTube",
      type:  "Trailer",
      name:  `Trailer of ${id}`,
      key:  config.DEFAULT_VIDEO_ID,
      title:  util.isValidProperty(rawData, 'name') ? rawData.name : "",
      media_type: 'tv'
    }
  )
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.18 TV show Details Endpoint (object)
app.get('/api/v1/tv/:id/details', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchTVShowDetails = async () => {
    try {
      const response = await axios.get(`/tv/${id}?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchTVShowDetails();
  let data = {};
  if(rawData != null){
    data = {
      title:  util.isValidProperty(rawData, 'name') ? rawData.name : "",
      genres:  util.isValidProperty(rawData, 'genres', 'array') ? rawData.genres : "",
      spoken_languages:  util.isValidProperty(rawData, 'spoken_languages', 'array') ? rawData.spoken_languages : "",
      first_air_date:  util.isValidProperty(rawData, 'first_air_date') ? rawData.first_air_date : "",
      episode_run_time:  util.isValidProperty(rawData, 'episode_run_time', 'array') ? rawData.episode_run_time : "",
      overview:  util.isValidProperty(rawData, 'overview') ? rawData.overview : "",
      vote_average:  util.isValidProperty(rawData, 'vote_average', 'number') ? rawData.vote_average : "",
      tagline:  util.isValidProperty(rawData, 'tagline') ? rawData.tagline : "",
      id: id,
      poster_path:  util.isValidProperty(rawData, 'poster_path') ? `${config.IMAGE_PATH_W500}${rawData.poster_path}` : "",
      media_type: 'tv',
    }
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.19 TV show Reviews Endpoint (10)
app.get('/api/v1/tv/:id/reviews', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchTVShowReviews = async () => {
    try {
      const response = await axios.get(`/tv/${id}/reviews?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchTVShowReviews();
  let data = [];
  if(rawData.results != null){
    rawData.results.forEach((result, i) => {
      if(i < 10){
        data.push({
          author:  util.isValidProperty(result, 'author') ? result.author : "",
          content:  util.isValidProperty(result, 'content') ? result.content : "",
          created_at:  util.isValidProperty(result, 'created_at') ? result.created_at : "",
          url:  util.isValidProperty(result, 'url') ? result.url : "",
          rating:  util.isValidProperty(result.author_details, 'rating', 'number') ? result.author_details.rating : 0,
          avatar_path:  util.isValidProperty(result.author_details, 'avatar_path') ? 
            (result.author_details.avatar_path.startsWith("/https") ? result.author_details.avatar_path.substring(1) : `${config.IMAGE_PATH_ORIGINAL}${result.author_details.avatar_path}`) : 
              null,
          media_type: 'tv'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.20 TV show Casts Endpoint (0^)
app.get('/api/v1/tv/:id/casts', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchTVShowCasts = async () => {
    try {
      const response = await axios.get(`/movie/${id}/credits?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchTVShowCasts();
  let data = [];
  if(rawData.cast != null && Array.isArray(rawData.cast)){
    rawData.cast.forEach((result) => {
      if(util.isValidProperty(result, 'profile_path')){
        data.push({
          id:  util.isValidProperty(result, 'id', 'number') ? result.id : "",
          name:  util.isValidProperty(result, 'name') ? result.name : "",
          character:  util.isValidProperty(result, 'character') ? result.character : "",
          profile_path:  util.isValidProperty(result, 'profile_path') ? `${config.IMAGE_PATH_W500}${result.profile_path}` : "",
          media_type: 'tv'
        })
      }
    })
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.21 Cast Details Endpoint (object)
app.get('/api/v1/cast/:id/details', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchCastDetails = async () => {
    try {
      const response = await axios.get(`/person/${id}?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchCastDetails();
  let data = {};
  if(rawData != null){
    data = {
      birthday:  util.isValidProperty(rawData, 'birthday') ? rawData.birthday : "",
      gender:  util.isValidProperty(rawData, 'gender', 'number') ? rawData.gender : 0,
      name:  util.isValidProperty(rawData, 'name') ? rawData.name : "",
      homepage:  util.isValidProperty(rawData, 'homepage') ? rawData.homepage : "",
      also_known_as:  util.isValidProperty(rawData, 'also_known_as', 'array') ? rawData.also_known_as : [],
      known_for_department:  util.isValidProperty(rawData, 'known_for_department') ? rawData.known_for_department : "",
      biography:  util.isValidProperty(rawData, 'biography') ? rawData.biography : "",
      place_of_birth: util.isValidProperty(rawData, 'place_of_birth') ? rawData.place_of_birth : "",
      website: util.isValidProperty(rawData, 'homepage') ? rawData.homepage : "",
      profile_path: util.isValidProperty(rawData, 'profile_path') ? `${config.IMAGE_PATH_W500}${rawData.profile_path}` : ""
    }
  }
  res.send({data: data, count: data.length});
  res.end();
})

//4.1.22 Cast External Ids Endpoint (object)
app.get('/api/v1/cast/:id/external-ids', async (req, res) => {
  const id = parseInt(req.params['id'], 10);
  const fetchCastExternalIds = async () => {
    try {
      const response = await axios.get(`/person/${id}/external_ids?api_key=${config.API_KEY}&language=en-US&page=1`);
      return response.data;
    } catch(error) {
      console.log(error);
    }
  }

  const rawData = await fetchCastExternalIds();
  let data = {};
  if(rawData != null){
    data = {
      imdb_id:  util.isValidProperty(rawData, 'imdb_id') ? `${config.IMDB_URL}${rawData.imdb_id}` : "",
      facebook_id:  util.isValidProperty(rawData, 'facebook_id') ? `${config.FACEBOOK_URL}${rawData.facebook_id}` : "",
      instagram_id:  util.isValidProperty(rawData, 'instagram_id') ? `${config.INSTAGRAM_URL}${rawData.instagram_id}` : "",
      twitter_id:  util.isValidProperty(rawData, 'twitter_id') ? `${config.TWITTER_URL}${rawData.twitter_id}` : "",
    }
  }
  res.send({data: data, count: data.length});
  res.end();
})

const server = app.listen(8080, () => {
    console.log("Backend Application listening at http://localhost:8080")
})