import StorageManager from "./storageManager.js";

export class Library {
  constructor (storageManager) {
    this.storageManager = storageManager;
  }

  generateLists (playlists, songs) {
    const playlistContainer = document.getElementById("playlist-container");
    playlistContainer.innerHTML = "";
    playlists.forEach((playlist) => {
      const playlistElement = this.buildPlaylistItem(playlist);
      playlistContainer.appendChild(playlistElement);
    });

    const songListContainer = document.getElementById("song-container");
    songListContainer.innerHTML = "";
    songs.forEach((song) => {
      const songElement = this.buildSongItem(song);
      songListContainer.appendChild(songElement);
    });
  }

  buildPlaylistItem (playlist) {
    const playlistItem = document.createElement("a");
    playlistItem.href = `./playlist.html?id=${playlist.id}`;
    playlistItem.classList.add("playlist-item", "flex-column");

    const imageDiv = document.createElement("div");
    imageDiv.classList.add("playlist-preview");
    playlistItem.appendChild(imageDiv);

    const playlistImage = document.createElement("img");
    playlistImage.src = playlist.thumbnail;
    imageDiv.appendChild(playlistImage);

    const icon = document.createElement("i");
    imageDiv.appendChild(icon);
    icon.outerHTML = `<i class="fa fa-2x fa-play-circle hidden playlist-play-icon"></i>`;

    const playlistName = document.createElement("p");
    playlistName.textContent = playlist.name;
    playlistItem.appendChild(playlistName);

    const playlistDescription = document.createElement("p");
    playlistDescription.textContent = playlist.description;
    playlistItem.appendChild(playlistDescription);

    return playlistItem;
  }

  buildSongItem = function (song) {
    const songItem = document.createElement("div");
    songItem.classList.add("song-item", "flex-row");

    const songName = document.createElement("p");
    songName.textContent = song.name;
    songItem.appendChild(songName);

    const songGenre = document.createElement("p");
    songGenre.textContent = song.genre;
    songItem.appendChild(songGenre);

    const songArtist = document.createElement("p");
    songArtist.textContent = song.artist;
    songItem.appendChild(songArtist);

    const likedButton = document.createElement("button");
    likedButton.classList.add("fa-heart", "fa-2x", song.liked ? "fa" : "fa-regular");

    likedButton.addEventListener("click", () => {
      likedButton.classList.replace(song.liked ? "fa" : "fa-regular", song.liked ? "fa-regular" : "fa");
      song.liked = !song.liked;
      this.storageManager.replaceItem(this.storageManager.STORAGE_KEY_SONGS, song);
    });
    songItem.appendChild(likedButton);

    return songItem;
  };

  load () {
    this.storageManager.loadAllData();
    const playlists = this.storageManager.getData(this.storageManager.STORAGE_KEY_PLAYLISTS);
    const songs = this.storageManager.getData(this.storageManager.STORAGE_KEY_SONGS);
    this.generateLists(playlists, songs);

    const searchButton = document.getElementById("search-btn");
    searchButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.search(
        document.getElementById("search-input"),
        { playlists, songs },
        document.getElementById("exact-search").checked
      );
    });
  }

  includesSubstring (originalString, substring, exactMatch) {
    const origin = exactMatch ? originalString : originalString.toLowerCase();
    const search = exactMatch ? substring : substring.toLowerCase();
    return origin.includes(search);
  }

  searchInFields (searchFields, searchValue, exactMatch) {
    for (const field in searchFields) {
      if (this.includesSubstring(searchFields[field], searchValue, exactMatch)) {
        return true;
      }
    }
    return false;
  }

  search (searchInput, searchSources, exactMatch) {
    const playlists = [];
    const songs = [];
    searchSources.playlists.forEach((playlist) => {
      if (this.searchInFields([playlist.name, playlist.description], searchInput.value, exactMatch)) {
        playlists.push(playlist);
      }
    });
    searchSources.songs.forEach((song) => {
      if (this.searchInFields([song.name, song.genre, song.artist], searchInput.value, exactMatch)) {
        songs.push(song);
      }
    });
    this.generateLists(playlists, songs);
  }
}

window.onload = () => {
  new Library(new StorageManager()).load();
};
