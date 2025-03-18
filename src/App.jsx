import { useState, useEffect } from 'react'
import './App.css'
import Search from './Components/Search'
import React from 'react'
import Spinner from './Components/Spinner';
import MovieCard from './Components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept:'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}
const App = () => {

const [searchTerm, setSearchTerm] = useState('');
const [errorMessage,setErrorMessage] = useState('');
const [movieList,setMovieList] = useState([]);
const [trendingMovies, setTrendingMovies] = useState('');
const [isLoading,setIsloading] = useState(false);
const [debouncedSearchterm,setDebouncedSearchterm] = useState('');

useDebounce(()=>setDebouncedSearchterm(searchTerm),500,[searchTerm])

const fetchMovies = async (query = '') => {
  setIsloading(true);
  setErrorMessage('');
  try {
    const endpoint = query 
    ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` 
    :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
    const response = await fetch(endpoint, API_OPTIONS)
    if(!response.ok){
      throw new Error('Failed to fetch movies')
    }

    const data = await response.json();
    if(data.Response == 'False'){
      setErrorMessage(data.Error || 'Failed to fetch movies');
      setMovieList([]);
      return;
    }

    setMovieList(data.results || []);
    if(query && data.results.length > 0){
      await updateSearchCount(query,data.results[0]);
    }
    updateSearchCount();
    //alert(response);
  } catch (error) {
    console.error(`Error fetching movies: ${error}`)
    setErrorMessage('Error fetching movies. Please try again later.');
  } finally {
    setIsloading(false);
  }
}

const loadTrendingMovies = async() => {
  try {
    const movies = await getTrendingMovies();
    setTrendingMovies(movies);
  } catch (error) {
    console.log(`Error fetching trending movies`)
  }
}

useEffect(()=>{
  fetchMovies(debouncedSearchterm);
},[debouncedSearchterm]);

useEffect(()=>{
  loadTrendingMovies();
},[])
  return (
    <main>
      <div className='pattern'/>

      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="Hero Banner"/>
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without The Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>
            <ul>
              {
                trendingMovies.map((movie,index) =>(
                  <li key={movie.$id}>
                    <p>{index+1}</p>
                    <img src={movie.poster_url} alt ={movie.title}/>
                  </li>
                ))
              }
            </ul>
          </section>
        )

        }

        <section className='all-movies'>
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner/>
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>
      </div>
  </main>
  )
}

export default App

/*const Card = ({title}) =>{
  const [count,setCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  useEffect(() =>{
    console.log(title + " has been liked: " + hasLiked);
  },[hasLiked]);

  useEffect( () => {
    console.log('CARD RENDERED')
  },[])
  return (
    <div className = "card" onClick={() => setCount((prev) => prev+1)}>
      <h2>{title} <br/> {count || null}</h2>

    <button onClick={() =>setHasLiked(!hasLiked)}>
      {hasLiked ? "❤️" : "🤍"}
    </button>
    </div>
  )
}
const App = () => {
 

  return (
    <div className='card-container'> 
    <Card title="NARUTO" rating={5} isCool={true} actors={[{name: 'Actors'}]}/>
    <Card title="Avatar" rating={5} isCool={true} actors={[{name: 'Actors'}]}/>
    <Card title="Avengers" rating={5} isCool={true} actors={[{name: 'Actors'}]}/>
    </div>
  )
}

export default App
*/