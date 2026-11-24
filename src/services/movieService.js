import { fetchFromTmdb, hasValidTmdbKey } from './tmdbApi';
import { getBackdropUrl, getPosterUrl, getProfileUrl } from '../utils/imageHelper';

const GENRE_ID_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  18: 'Drama',
  14: 'Fantasy',
  27: 'Horror',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
};

const GENRE_NAME_TO_ID = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Drama: 18,
  Fantasy: 14,
  Horror: 27,
  Mystery: 9648,
  Romance: 10749,
  'Sci-Fi': 878,
  Thriller: 53,
};

const LANGUAGE_CODE_MAP = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  ja: 'Japanese',
  ko: 'Korean',
};

const LANGUAGE_NAME_TO_CODE = {
  English: 'en',
  Hindi: 'hi',
  Tamil: 'ta',
  Telugu: 'te',
  Japanese: 'ja',
  Korean: 'ko',
};

function formatRuntime(minutes) {
  if (!minutes || Number.isNaN(Number(minutes))) {
    return '2h 10m';
  }
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

export function normalizeTmdbMovie(raw, statusOverride = 'Now Showing') {
  const firstGenreId = Array.isArray(raw.genre_ids) ? raw.genre_ids[0] : null;
  const genresList = Array.isArray(raw.genres)
    ? raw.genres.map((g) => g.name)
    : Array.isArray(raw.genre_ids)
      ? raw.genre_ids.map((id) => GENRE_ID_MAP[id]).filter(Boolean)
      : [];

  const primaryGenre =
    genresList[0] || GENRE_ID_MAP[firstGenreId] || 'Drama';

  const languageName =
    LANGUAGE_CODE_MAP[raw.original_language] ||
    (raw.original_language ? raw.original_language.toUpperCase() : 'English');

  return {
    id: `tmdb-${raw.id}`,
    tmdbId: raw.id,
    title: raw.title || raw.original_title || 'Untitled Movie',
    genre: primaryGenre,
    genres: genresList.length > 0 ? genresList : [primaryGenre],
    language: languageName,
    duration: raw.runtime ? formatRuntime(raw.runtime) : '2h 12m',
    rating: Number(raw.vote_average || 7.5),
    popularity: Number(raw.popularity || 80),
    releaseDate: raw.release_date || '2026-11-15',
    status: statusOverride,
    certificate: raw.adult ? 'A' : 'UA 13+',
    format: '2D / Dolby Atmos',
    director: 'TMDB Featured Director',
    cast: [],
    description:
      raw.overview ||
      'Experience this theatrical release on the big screen with CineBook.',
    poster: getPosterUrl(raw.poster_path, 'w500'),
    banner: getBackdropUrl(raw.backdrop_path || raw.poster_path, 'w1280'),
    source: 'tmdb',
  };
}

export async function getHomeCollections(localMovies = []) {
  if (!hasValidTmdbKey()) {
    return {
      source: 'demo',
      trending: localMovies.filter((m) => m.isTrending).slice(0, 8),
      nowPlaying: localMovies.filter((m) => m.status === 'Now Showing'),
      upcoming: localMovies.filter((m) => m.status === 'Upcoming'),
      topRated: [...localMovies].sort((a, b) => b.rating - a.rating),
      tamilMovies: localMovies.filter((m) => m.language === 'Tamil'),
      hollywoodMovies: localMovies.filter((m) => m.language === 'English'),
      recommended: localMovies.slice(0, 6),
    };
  }

  const [
    trendingRes,
    nowPlayingRes,
    upcomingRes,
    topRatedRes,
    tamilRes,
    hollywoodRes,
  ] = await Promise.all([
    fetchFromTmdb('/trending/movie/week'),
    fetchFromTmdb('/movie/now_playing', { page: 1 }),
    fetchFromTmdb('/movie/upcoming', { page: 1 }),
    fetchFromTmdb('/movie/top_rated', { page: 1 }),
    fetchFromTmdb('/discover/movie', {
      with_original_language: 'ta',
      sort_by: 'popularity.desc',
    }),
    fetchFromTmdb('/discover/movie', {
      with_original_language: 'en',
      sort_by: 'popularity.desc',
    }),
  ]);

  const trending = (trendingRes.results || []).map((m) =>
    normalizeTmdbMovie(m, 'Now Showing')
  );
  const nowPlaying = (nowPlayingRes.results || []).map((m) =>
    normalizeTmdbMovie(m, 'Now Showing')
  );
  const upcoming = (upcomingRes.results || []).map((m) =>
    normalizeTmdbMovie(m, 'Upcoming')
  );
  const topRated = (topRatedRes.results || []).map((m) =>
    normalizeTmdbMovie(m, 'Now Showing')
  );
  const tamilMovies = (tamilRes.results || []).map((m) =>
    normalizeTmdbMovie(m, 'Now Showing')
  );
  const hollywoodMovies = (hollywoodRes.results || []).map((m) =>
    normalizeTmdbMovie(m, 'Now Showing')
  );

  return {
    source: 'tmdb',
    trending: [...localMovies.slice(0, 2), ...trending].slice(0, 12),
    nowPlaying,
    upcoming,
    topRated,
    tamilMovies,
    hollywoodMovies,
    recommended: topRated.slice(0, 10),
  };
}

export async function discoverMovies({
  query = '',
  genre = 'All',
  language = 'All',
  minRating = '0',
  year = 'All',
  sortBy = 'popularity',
  page = 1,
  localMovies = [],
}) {
  if (!hasValidTmdbKey()) {
    const filtered = localMovies
      .filter((movie) => {
        const matchesQuery =
          !query.trim() ||
          movie.title.toLowerCase().includes(query.toLowerCase()) ||
          (movie.director || '').toLowerCase().includes(query.toLowerCase());
        const matchesGenre = genre === 'All' || movie.genre === genre;
        const matchesLanguage =
          language === 'All' || movie.language === language;
        const matchesRating = Number(movie.rating) >= Number(minRating);
        const movieYear = (movie.releaseDate || '').slice(0, 4);
        const matchesYear = year === 'All' || movieYear === year;
        return (
          matchesQuery &&
          matchesGenre &&
          matchesLanguage &&
          matchesRating &&
          matchesYear
        );
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return Number(b.rating) - Number(a.rating);
        }
        if (sortBy === 'release_date') {
          return String(b.releaseDate).localeCompare(String(a.releaseDate));
        }
        return Number(b.popularity || 0) - Number(a.popularity || 0);
      });

    return {
      movies: filtered,
      totalPages: 1,
      source: 'demo',
    };
  }

  let data;
  if (query.trim()) {
    data = await fetchFromTmdb('/search/movie', {
      query: query.trim(),
      page,
    });
  } else {
    const tmdbSortMap = {
      popularity: 'popularity.desc',
      rating: 'vote_average.desc',
      release_date: 'primary_release_date.desc',
    };

    const params = {
      page,
      sort_by: tmdbSortMap[sortBy] || 'popularity.desc',
      'vote_count.gte': sortBy === 'rating' ? 150 : 20,
    };

    if (genre !== 'All' && GENRE_NAME_TO_ID[genre]) {
      params.with_genres = GENRE_NAME_TO_ID[genre];
    }
    if (language !== 'All' && LANGUAGE_NAME_TO_CODE[language]) {
      params.with_original_language = LANGUAGE_NAME_TO_CODE[language];
    }
    if (Number(minRating) > 0) {
      params['vote_average.gte'] = minRating;
    }
    if (year !== 'All') {
      params.primary_release_year = year;
    }

    data = await fetchFromTmdb('/discover/movie', params);
  }

  let normalized = (data.results || []).map((m) =>
    normalizeTmdbMovie(m, 'Now Showing')
  );

  // Client-side refinement when search endpoint doesn't accept discover filters
  if (query.trim()) {
    normalized = normalized.filter((movie) => {
      const matchesGenre =
        genre === 'All' ||
        movie.genre === genre ||
        (movie.genres && movie.genres.includes(genre));
      const matchesLanguage =
        language === 'All' || movie.language === language;
      const matchesRating = Number(movie.rating) >= Number(minRating);
      const matchesYear =
        year === 'All' || (movie.releaseDate || '').startsWith(year);
      return matchesGenre && matchesLanguage && matchesRating && matchesYear;
    });
  }

  return {
    movies: normalized,
    totalPages: Math.min(Number(data.total_pages || 1), 20),
    source: 'tmdb',
  };
}

export async function getMovieFullDetails(movieId, localMovies = []) {
  const localMatch = localMovies.find((item) => item.id === movieId);

  if (localMatch && (!String(movieId).startsWith('tmdb-') || !hasValidTmdbKey())) {
    const similarLocal = localMovies
      .filter((m) => m.id !== localMatch.id && m.genre === localMatch.genre)
      .slice(0, 4);
    const recommendedLocal = localMovies
      .filter((m) => m.id !== localMatch.id)
      .slice(0, 4);

    const castObjects = Array.isArray(localMatch.cast)
      ? localMatch.cast.map((entry) =>
          typeof entry === 'string'
            ? { name: entry, character: 'Lead Cast', profileImage: null }
            : entry
        )
      : [];

    return {
      movie: {
        ...localMatch,
        castMembers: castObjects,
      },
      similarMovies: similarLocal.length > 0 ? similarLocal : recommendedLocal,
      recommendedMovies: recommendedLocal,
      trailerKey: localMatch.trailerKey || null,
    };
  }

  const numericId = String(movieId).replace('tmdb-', '');
  if (!hasValidTmdbKey()) {
    return null;
  }

  const detail = await fetchFromTmdb(`/movie/${numericId}`, {
    append_to_response: 'credits,videos,similar,recommendations',
  });

  const normalized = normalizeTmdbMovie(
    detail,
    detail.status === 'Released' ? 'Now Showing' : 'Upcoming'
  );

  const crew = detail.credits && Array.isArray(detail.credits.crew)
    ? detail.credits.crew
    : [];
  const directorEntry = crew.find((member) => member.job === 'Director');

  const rawCast = detail.credits && Array.isArray(detail.credits.cast)
    ? detail.credits.cast.slice(0, 10)
    : [];

  const castMembers = rawCast.map((person) => ({
    id: person.id,
    name: person.name,
    character: person.character || 'Cast',
    profileImage: getProfileUrl(person.profile_path, 'w185'),
  }));

  const videos = detail.videos && Array.isArray(detail.videos.results)
    ? detail.videos.results
    : [];
  const youtubeTrailer =
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
    videos.find((v) => v.site === 'YouTube');

  const similarMovies = (
    (detail.similar && detail.similar.results) ||
    []
  )
    .slice(0, 8)
    .map((m) => normalizeTmdbMovie(m, 'Now Showing'));

  const recommendedMovies = (
    (detail.recommendations && detail.recommendations.results) ||
    []
  )
    .slice(0, 8)
    .map((m) => normalizeTmdbMovie(m, 'Now Showing'));

  return {
    movie: {
      ...normalized,
      director: directorEntry ? directorEntry.name : 'Featured Director',
      cast: castMembers.map((c) => c.name),
      castMembers,
      trailerUrl: youtubeTrailer
        ? `https://www.youtube.com/watch?v=${youtubeTrailer.key}`
        : '',
    },
    similarMovies,
    recommendedMovies,
    trailerKey: youtubeTrailer ? youtubeTrailer.key : null,
  };
}

export async function searchTmdbForAdmin(query) {
  if (!hasValidTmdbKey() || !query.trim()) {
    return [];
  }
  const data = await fetchFromTmdb('/search/movie', {
    query: query.trim(),
    page: 1,
  });
  return (data.results || []).slice(0, 12).map((m) => normalizeTmdbMovie(m));
}
