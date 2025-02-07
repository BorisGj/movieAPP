const API_ENDPOINT='http://localhost:8000/'; // get from env in real app, swap to your php app port if it is not 8000
let currentPage = 1;
const basePath = "https://image.tmdb.org/t/p/original/";
let currentKeyword = " ";
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const modal = document.getElementById("movieModal");

function fetchMovies() {
  try {
    const keyword = $("#searchInput").val().trim() || " ";
    currentKeyword = keyword;
    const url = `${API_ENDPOINT}api/movie/${encodeURIComponent(
      keyword
    )}/${currentPage}`;

    $("#loading").show();
    $("#moviesList").hide();

    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      success: function (data) {
        let movies = data.results;
        movies = sortMovies(movies);
        displayMovies(movies);
        updatePagination(data.page, data.total_pages);
      },
      error: function (error) {
        alert("An error occurred while applying sorting. Please try again.");
        console.error("Error fetching movie:", error);
      },
      complete: function () {
        $("#loading").hide();
        $("#moviesList").show();
      },
    });
  } catch (erorr) {
    alert("An error occurred while applying sorting. Please try again.");
    console.log(error);
  }
}

function displayMovies(movies) {
  const moviesList = $("#moviesList");
  moviesList.empty();
  const template = document.getElementById("movieTemplate").content;

  movies.forEach((movie) => {
    const image = movie.poster_path
      ? `${basePath}/${movie.poster_path}`
      : "placeholder.webp";
    const clone = document.importNode(template, true);
    $(clone).find(".poster").attr("src", image).attr("alt", movie.title);
    $(clone).find(".title").text(movie.title);
    $(clone).find(".overview").text(movie.overview);
    $(clone)
      .find(".release-year")
      .text(movie.release_date ? movie.release_date.split("-")[0] : "N/A");
    $(clone)
      .find(".favorite-btn")
      .click(() => addToFavorites(movie.id));
    $(clone)
      .find(".details-btn")
      .click(() => openDetailsModal(movie.id));
    moviesList.append(clone);
  });
}

function updatePagination(page, totalPages) {
  $("#pageNumber").text(`Page ${page}`);
  $("#totalPages").text(`of ${totalPages}`);
  $("#prevPage").prop("disabled", page <= 1);
  $("#nextPage").prop("disabled", page >= totalPages);
}

function changePage(direction) {
  currentPage += direction;
  fetchMovies();
}

// DId not have the time to complete this part
// I would just add a selector to choose if the user wants a normal view or view of favorite movies
// If they choose favorite, the logic would be the same, i would just call a different api endpoint to fetch the favorite movies only
// based on the ids stored
// For now, this just stores the favorite ids in local browser storage
function addToFavorites(movieId) {
  if (!favorites.includes(movieId)) {
    favorites.push(movieId);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
}

function openDetailsModal(movieId) {
  try {
    let favlist = localStorage.getItem("favorites");
    console.log(favlist);
    const url = `${API_ENDPOINT}/api/movieById/${encodeURIComponent(
      movieId
    )}`;
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      success: function (data) {
        displayModal(data);
      },
      error: function (error) {
        alert("An error occurred while applying sorting. Please try again.");
        console.error("Error fetching movie:", error);
      },
    });
  } catch (error) {
    alert("An error occurred while applying sorting. Please try again.");
    console.log(error);
  }
}

function displayModal(data) {
  console.log(data);
  const moviesDetails = $("#movieDetails");
  console.log(moviesDetails);
  moviesDetails.empty();
  const template = document.getElementById("movieDetailsTemplate").content;

  const clone = document.importNode(template, true);
  $(clone).find(".title").text(data.title);
  $(clone)
    .find(".genres")
    .text(
      `Genres: ${data.genres
        .map((genre) => genre.name)
        .toString()
        .split(",")
        .join(", ")}`
    );

  $(clone).find(".overview").text(data.overview);
  $(clone).find(".runtime").text(`Runtime: ${data.runtime} minutes`);
  $(clone)
    .find(".rating")
    .text(
      `Rating: ${parseFloat(data.vote_average).toFixed(2)} (${
        data.vote_count
      } votes)`
    );

  console.log($(clone).innerHTML);
  moviesDetails.append(clone);
  modal.style.display = "block";
}

function closeDetailsModal() {
  modal.style.display = "none";
}

$(document).ready(fetchMovies);

$("<div class='sort-container'>")
  .insertBefore("#searchInput")
  .append(
    "<select id='sortBy'><option value=''>Sort By</option><option value='title'>Title</option><option value='year'>Year</option></select>"
  )
  .append(
    "<select id='sortOrder'><option value='desc'>Descending</option><option value='asc'>Ascending</option></select>"
  );

$("<style>")
  .prop("type", "text/css")
  .html(
    `
    .sort-container { text-align: center; margin-bottom: 10px; }
    .sort-container select { padding: 5px; margin: 0 5px; border-radius: 5px; }
  `
  )
  .appendTo("head");

// Normally i would like to do this with the backend during the data fetch query, as it would be much better due to pagination
// In my research, I found that it is only possible to sort movie database api calls when they are of the discover type only
// Therefore, based on that, it would be impossible to do it on the data fetch api call while also searching with keyword.
//  I could be wrong as i am not very
// familiar with the movie database api
function sortMovies(movies) {
  const sortBy = $("#sortBy").val();
  const sortOrder = $("#sortOrder").val();

  if (sortBy) {
    movies.sort((a, b) => {
      let valA = sortBy === "title" ? a.title.toLowerCase() : a.release_date;
      let valB = sortBy === "title" ? b.title.toLowerCase() : b.release_date;

      if (!valA) return 1;
      if (!valB) return -1;
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }
  return movies;
}

$("#sortBy, #sortOrder").change(fetchMovies);
