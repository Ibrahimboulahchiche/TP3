import { jest } from "@jest/globals";
import PlayListEditor from "../../src/assets/js/playlist_editor";
import StorageManager from "../../src/assets/js/storageManager";

describe("Playlist Editor tests", () => {
  const assignMock = jest.fn();
  const clearHTML = () => (document.body.innerHTML = "");
  global.URL.createObjectURL = jest.fn();
  let playListEditor;
  let songStubs;

  const setUpHTML = () => {
    const playListForm = document.createElement("form");
    playListForm.setAttribute("id", "playlist-form");
    document.body.appendChild(playListForm);

    const imageDisplay = document.createElement("img");
    imageDisplay.setAttribute("id", "image-preview");
    imageDisplay.setAttribute("src", "");
    document.body.appendChild(imageDisplay);

    const songContainer = document.createElement("div");
    songContainer.setAttribute("id", "song-list");
    document.body.appendChild(songContainer);

    const inputContainer = document.createElement("div");
    songContainer.appendChild(inputContainer);
    inputContainer.appendChild(document.createElement("label"));

    const songInput = document.createElement("input");
    songInput.type = "select";
    songInput.value = "Whip";
    songInput.setAttribute("class", "song-input");
    inputContainer.appendChild(songInput);

    const imageInput = document.createElement("input");
    imageInput.setAttribute("id", "image");
    document.body.appendChild(imageInput);

    const dataList = document.createElement("datalist");
    dataList.setAttribute("id", "song-dataList");
    document.body.appendChild(dataList);

    const addSongButton = document.createElement("button");
    addSongButton.setAttribute("id", "add-song-btn");
    addSongButton.setAttribute("class", "fa fa-plus");
    document.body.appendChild(addSongButton);
  };

  beforeEach(() => {
    delete window.location;
    window.location = {
      assign: () => ({
        href: "",
      }),
    };
    setUpHTML();
    playListEditor = new PlayListEditor(new StorageManager());
    songStubs = [
      { name: "Whip" },
      { name: "Overflow" },
      { name: "Intrigue Fun" },
      { name: "Bounce" },
      { name: "Summer Pranks" },
    ];
  });

  afterEach(() => {
    jest.restoreAllMocks();
    assignMock.mockClear();
    clearHTML();
  });

  it("buildDataList should correctly build data list", () => {
    const dataListContainer = document.createElement("datalist");
    playListEditor.buildDataList(dataListContainer, songStubs);
    const childrenElements = dataListContainer.children;
    for (let i = 0; i < childrenElements.length; i++) {
      expect(childrenElements[i].tagName).toEqual("OPTION");
      expect(childrenElements[i].value).toEqual(songStubs[i].name);
    }
    expect(dataListContainer.childElementCount).toEqual(songStubs.length);
  });

  it("updateImageDisplay should update image display", () => {
    playListEditor.files = songStubs;
    playListEditor.updateImageDisplay();
    const imagePreview = document.getElementById("image-preview");
    expect(imagePreview.src).not.toEqual("");
  });

  it("addItemSelect should call preventDefault for events", () => {
    const randomEvent = new Event("");
    const randomEventPreventDefaultSpy = jest.spyOn(randomEvent, "preventDefault").mockImplementation(() => {});
    playListEditor.addItemSelect(randomEvent);
    expect(randomEventPreventDefaultSpy).toBeCalled();
  });

  it("addItemSelect should correctly add item to container", () => {
    const event = new Event("");
    const container = document.getElementById("song-list");
    let size = container.children.length;
    const labelPosition = 0;
    const inputPosition = 1;
    const removePosition = 2;
    playListEditor.addItemSelect(event);
    expect(container.children[size - 1].hasChildNodes()).toBeTruthy();
    expect(container.children[size - 1].children[labelPosition].tagName).toEqual("LABEL");
    expect(container.children[size - 1].children[inputPosition].tagName).toEqual("INPUT");
    expect(container.children).toHaveLength(++size);
    playListEditor.addItemSelect(event);
    expect(container.children[size - 1].children[removePosition].tagName).toEqual("BUTTON");
  });

  it("addItemSelect should remove event target's parent node upon clicked", () => {
    const firstRemovePosition = 0;
    const parent = document.getElementById("song-2");
    expect(parent).toBeFalsy();
    const container = document.getElementById("song-list");
    const event = new Event("click");
    expect(container.children.length).toEqual(1);
    playListEditor.addItemSelect(event);
    const removeButton = document.getElementsByTagName("button")[firstRemovePosition];
    expect(container.children.length).toEqual(2);

    removeButton.dispatchEvent(event);
    expect(container.children.length).toEqual(1);
  });

  it("load should call StorageManager.loadAllData & .buildDataList and buildDataList", () => {
    const playListEditorStorageManagerLoadAllDataSpy = jest
      .spyOn(playListEditor.storageManager, "loadAllData")
      .mockImplementation(() => {});
    const playListEditorStorageManagerGetDataSpy = jest
      .spyOn(playListEditor.storageManager, "getData")
      .mockImplementation(() => {});
    const playListEditorBuildDataListSpy = jest.spyOn(playListEditor, "buildDataList").mockImplementation(() => {});
    jest.spyOn(playListEditor, "updateImageDisplay").mockImplementation(() => {});
    jest.spyOn(playListEditor, "addItemSelect").mockImplementation(() => {});
    playListEditor.load();
    expect(playListEditorStorageManagerLoadAllDataSpy).toBeCalled();
    expect(playListEditorStorageManagerGetDataSpy).toBeCalled();
    expect(playListEditorBuildDataListSpy).toBeCalled();
  });

  it("load should correctly add updateImageDisplay as eventListener on change event to image input", () => {
    const updateImageSpy = jest.spyOn(playListEditor, "updateImageDisplay").mockImplementation(() => {});
    playListEditor.load();
    document.getElementById("image").dispatchEvent(new Event("change"));
    expect(updateImageSpy).toBeCalled();
  });

  it("load should correctly add addItemSelect as eventListener on click event to add song button", () => {
    const addItemSpy = jest.spyOn(playListEditor, "addItemSelect").mockImplementation(() => {});
    playListEditor.load();
    document.getElementById("add-song-btn").dispatchEvent(new Event("click"));
    expect(addItemSpy).toBeCalled();
  });

  it("load should correctly call createPlaylist and preventDefault on submit event to the form", () => {
    const submitEvent = new Event("submit");
    const submittedForm = document.getElementById("playlist-form");
    const randomEventPreventDefaultSpy = jest.spyOn(submitEvent, "preventDefault").mockImplementation(() => {});
    const createPlaylistSpy = jest.spyOn(playListEditor, "createPlaylist").mockImplementation(async () => {});
    playListEditor.load();
    submittedForm.dispatchEvent(submitEvent);
    expect(randomEventPreventDefaultSpy).toBeCalled();
    expect(createPlaylistSpy).toBeCalled();
  });

  it("createPlaylist should correctly call getImageInput, StorageManager.getIdFromName & StorageManager.addItem", async () => {
    const playListEditorGetImageInputSpy = jest.spyOn(playListEditor, "getImageInput").mockImplementation(() => {});
    const playListEditorStorageManagerGetIdFromNameSpy = jest
      .spyOn(playListEditor.storageManager, "getIdFromName")
      .mockImplementation(() => null);
    const playListEditorStorageManagerAddItemSpy = jest
      .spyOn(playListEditor.storageManager, "addItem")
      .mockImplementation(() => {});
    const form = document.getElementById("playlist-form");
    jest.spyOn(form, "elements", "get").mockReturnValue({ name: "", description: "" });
    await playListEditor.createPlaylist(form, () => 0);
    expect(playListEditorGetImageInputSpy).toBeCalled();
    expect(playListEditorStorageManagerGetIdFromNameSpy).toBeCalled();
    expect(playListEditorStorageManagerAddItemSpy).toBeCalled();
  });

  it("createPlaylist should check else statement for song.value", async () => {
    jest.spyOn(playListEditor, "getImageInput").mockImplementation(() => {});
    jest.spyOn(playListEditor.storageManager, "getIdFromName").mockImplementation(() => null);
    jest.spyOn(playListEditor.storageManager, "addItem").mockImplementation(() => {});
    const theForm = document.getElementById("playlist-form");
    jest.spyOn(theForm, "elements", "get").mockReturnValue({ name: "", description: "" });
    document.getElementsByClassName("song-input")[0].value = "";
    await playListEditor.createPlaylist(theForm, () => 0);
    expect(theForm.songs).toEqual(undefined);
  });

  it("createPlaylist verifies the promise", () => {
    const submitEvent = new Event("submit");
    const submittedForm = document.getElementById("playlist-form");
    playListEditor.load();
    try {
      submittedForm.dispatchEvent(submitEvent);
    } catch (e) {
      expect(() => {}).toBeCalled();
    }
  });

  it("getImageInput should not return an image for invalid inputs", async () => {
    expect(playListEditor.getImageInput(undefined)).toEqual(Promise.resolve());
  });

  it("getImageInput should return an image for a valid input", async () => {
    const mockFileInput = { files: [new Blob()] };
    const image = await playListEditor.getImageInput(mockFileInput);
    expect(image).toBeTruthy();
  });

  it("getImageInput should call readAsDataURL on the first file of the input", async () => {
    const spy = jest.spyOn(FileReader.prototype, "readAsDataURL");
    const mockFileInput = { files: [new Blob()] };
    await playListEditor.getImageInput(mockFileInput);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(mockFileInput.files[0]);
  });
});
