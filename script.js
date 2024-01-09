const count = 10;
const apiKey = "DEMO_KEY";
const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${count}`;

const loaderEl = document.querySelector(".loader");
const imagesContainerEl = document.querySelector(".images-container");
const saveConfirmedEl = document.querySelector(".save-confirmed");
const favoriteEl = document.querySelector(".favorite");
const loadMoreEl = document.querySelectorAll(".load-more");
const resultsNavEl = document.getElementById("resultsNav");
const favoritesNavEl = document.getElementById("favoritesNav");
const input = document.querySelector("input");

let cardEl;
let resultsArray = [];
let favorites = {};

input.addEventListener("change", (e) => {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
});

const showContent = (page) => {
  window.scrollTo({ top: 0, behavior: "instant" });
  if (page === "results") {
    resultsNavEl.classList.remove("hidden");
    favoritesNavEl.classList.add("hidden");
  } else {
    resultsNavEl.classList.add("hidden");
    favoritesNavEl.classList.remove("hidden");
  }
  loaderEl.classList.add("hidden");
};

const favoriteHandler = (cardUrl) => {
  let cardElArray = Array.from(cardEl);
  const selectedCard = cardElArray.filter(
    (card) => card.firstChild.children[0].currentSrc === cardUrl
  );
  resultsArray.forEach((item) => {
    if (item.url === cardUrl && !favorites[cardUrl]) {
      favorites[cardUrl] = item;
      //I want to show an alert, but not working for some reason
      // saveConfirmedEl.hidden = false;
      // setTimeout(() => {
      //   saveConfirmedEl.hidden = true;
      // }, 2000);
      selectedCard[0].lastChild.children[1].firstChild.textContent = "";
      selectedCard[0].lastChild.children[1].lastChild.classList.replace(
        "fa-regular",
        "fa-solid"
      );

      localStorage.setItem("nasaFavorites", JSON.stringify(favorites));
    }
  });
};

const removeFavorite = (cardUrl) => {
  if (favorites[cardUrl]) {
    delete favorites[cardUrl];
    localStorage.setItem("nasaFavorites", JSON.stringify(favorites));
    cardsCreator("favorites");
  }
};

const cardParaResizer = (cardUrl, page) => {
  const currentArray =
    page === "results" ? resultsArray : Object.values(favorites);
  let cardElArray = Array.from(cardEl);
  const selectedCard = cardElArray.filter(
    (card) => card.firstChild.children[0].currentSrc === cardUrl
  );
  // console.log(cardEl);
  // console.log(selectedCard);
  currentArray.forEach((item) => {
    if (item.url === cardUrl) {
      if (
        selectedCard[0].lastChild.children[2].children[0].innerHTML ===
        "Read Less"
      ) {
        const miniExplanation = item.explanation.substring(0, 300);
        selectedCard[0].lastChild.children[2].firstChild.textContent =
          miniExplanation;
        selectedCard[0].lastChild.children[2].children[0].textContent =
          "...Read More";
      } else {
        selectedCard[0].lastChild.children[2].firstChild.textContent =
          item.explanation;
        selectedCard[0].lastChild.children[2].children[0].textContent =
          "Read Less";
      }
    }
  });
};

const createDOMNodes = (page) => {
  const currentArray =
    page === "results" ? resultsArray : Object.values(favorites);
  currentArray.forEach((item) => {
    // const { date, explanation, hdurl, title, url } = item;
    const miniExplanation = item.explanation.substring(0, 300);

    const card = document.createElement("div");
    card.classList.add("card");

    const anchor = document.createElement("a");
    anchor.setAttribute("href", `${item.hdurl}`);
    anchor.setAttribute("title", "View Full Image");
    anchor.setAttribute("target", "_blank");

    const image = document.createElement("img");
    image.setAttribute("src", `${item.url}`);
    image.setAttribute("alt", "NASA Picture of the day");
    image.setAttribute("loading", "lazy");
    image.classList.add("card-img-top");

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const heading = document.createElement("h5");
    heading.classList.add("card-title");
    heading.textContent = item.title;

    const favorite = document.createElement("div");
    favorite.classList.add("favorite");

    const addBtn = document.createElement("p");
    addBtn.classList.add("clickable");
    if (page === "results") {
      addBtn.textContent = "Add to Favorites";
      addBtn.addEventListener("click", () => {
        favoriteHandler(item.url);
      });
    } else {
      addBtn.textContent = "Remove Favorite";
      addBtn.addEventListener("click", () => {
        removeFavorite(item.url);
      });
    }

    const heartBtn = document.createElement("i");
    heartBtn.classList.add("fa-regular", "fa-heart");

    const descResizer = document.createElement("span");
    descResizer.classList.add("clickable");
    descResizer.textContent = "...Read More";
    descResizer.addEventListener("click", () => {
      cardParaResizer(item.url, page);
    });

    const description = document.createElement("p");
    description.classList.add("card-text");
    description.textContent = `${miniExplanation}`;
    description.appendChild(descResizer);

    const footerText = document.createElement("small");
    footerText.classList.add("text-muted");

    const dateField = document.createElement("strong");
    dateField.textContent = `${item.date}`;

    const copyrightField = document.createElement("span");
    copyrightField.textContent = ` ${
      item.copyright ? item.copyright : "unknown"
    }`;

    footerText.append(dateField, copyrightField);
    favorite.append(addBtn, page === "results" ? heartBtn : "");
    cardBody.append(heading, favorite, description, footerText);
    anchor.appendChild(image);
    card.append(anchor, cardBody);
    imagesContainerEl.appendChild(card);
  });
};

const cardsCreator = (page) => {
  if (localStorage.getItem("nasaFavorites")) {
    favorites = JSON.parse(localStorage.getItem("nasaFavorites"));
  }
  imagesContainerEl.textContent = "";
  createDOMNodes(page);
  showContent(page);
  cardEl = document.querySelectorAll(".card");
};

const dataFetcher = async () => {
  loaderEl.classList.remove("hidden");
  try {
    const res = await fetch(apodUrl);
    resultsArray = await res.json();
    cardsCreator("results");
  } catch (error) {
    console.log(error);
  }
};
// cardsCreator();

dataFetcher();

favoriteEl.addEventListener("click", () => cardsCreator("favorites"));
loadMoreEl.forEach((el) => el.addEventListener("click", () => dataFetcher()));
