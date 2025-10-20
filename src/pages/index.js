import "./index.css";
import Api from "../utils/Api.js";
import setButtonText from "../utils/helpers.js";
import {
  enableValidation,
  resetValidation,
  disableSubmitButton,
  settings,
} from "../scripts/validation.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "c0376a24-40a2-4f7e-9321-e6399fdf18e6",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, user]) => {
    cards.forEach(function (item) {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });

    profileAvatarEl.src = user.avatar;
    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
  })
  .catch(console.error);

const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const newPostModal = document.querySelector("#new-post-modal");
const newPostBtn = document.querySelector(".profile__add-btn");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const addPostFormEl = newPostModal.querySelector(".modal__form");
const addPostImageInput = newPostModal.querySelector("#card-image-input");
const addPostCaptionInput = newPostModal.querySelector("#card-caption-input");
const addPostSubmitBtn = newPostModal.querySelector(".modal__submit-btn");

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");

const previewModal = document.querySelector("#preview-modal");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const previewImageEl = previewModal.querySelector(".modal__image");

const avatarModalButton = document.querySelector(".profile__avatar-btn");
const avatarModal = document.querySelector("#avatar-modal");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarInput = avatarModal.querySelector("#avatar-link-input");

const deleteModal = document.querySelector("#delete-modal");
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close-btn");
const deleteCancelBtn = deleteModal.querySelector(".modal__delete-cancel");
const deleteForm = deleteModal.querySelector(".modal__form");

let selectedCard;
let selectedCardId;

previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

function handleImageClick() {
  previewImageEl.src = data.link;
  previewImageEl.alt = data.name;
  previewModalCaptionEl.textContent = data.name;
  openModal(previewModal);
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleLikeCard(evt, id) {
  const isLiked = evt.target.classList.contains("card__like-btn_liked");
  api
    .likeCard(id, isLiked)
    .then(() => {
      evt.target.classList.toggle("card__like-btn_liked");
    })
    .catch(console.error);
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("click", handleClick);
  document.removeEventListener("keydown", handleEscape);
}

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");

  cardTitleEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  if (data.isLiked == true) {
    cardLikeBtnEl.classList.add("card__like-btn_liked");
  }

  cardLikeBtnEl.addEventListener("click", (evt) =>
    handleLikeCard(evt, data._id)
  );

  cardDeleteBtnEl.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );

  cardImageEl.addEventListener("click", () => {
    handleImageClick(data);
  });

  return cardElement;
}

const handleClick = (event) => {
  const modal = document.querySelector(".modal_is-opened");
  if (event.target.classList.contains("modal")) closeModal(modal);
};

const handleEscape = (event) => {
  const modal = document.querySelector(".modal_is-opened");
  if (event.key === "Escape") closeModal(modal);
};

editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(
    editProfileForm,
    [editProfileNameInput, editProfileDescriptionInput],
    settings
  );
  openModal(editProfileModal);
});

avatarModalButton.addEventListener("click", function () {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", function () {
  closeModal(avatarModal);
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

deleteModalCloseBtn.addEventListener("click", function () {
  closeModal(deleteModal);
});

deleteCancelBtn.addEventListener("click", function () {
  closeModal(deleteModal);
});

function handleEditProfileSubmit(evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonText(submitButton, true);

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitButton, false);
    });
}

function handleEditNewPostSubmit(evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonText(submitButton, true);

  const inputValues = {
    name: addPostCaptionInput.value,
    link: addPostImageInput.value,
  };

  api
    .postCard(inputValues)
    .then((data) => {
      const cardElement = getCardElement(data);
      cardsList.prepend(cardElement);
      addPostFormEl.reset();
      disableSubmitButton(addPostSubmitBtn, settings);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitButton, false);
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonText(submitButton, true);

  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      profileAvatarEl.src = data.avatar;
      avatarForm.reset();
      closeModal(avatarModal);
      console.log(data);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitButton, false);
    });
}

function handledeleteSubmit(evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonText(submitButton, true, "Delete", "Deleting...");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitButton, false, "Delete", "Deleting...");
    });
}

addPostFormEl.addEventListener("submit", handleEditNewPostSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);
deleteForm.addEventListener("submit", handledeleteSubmit);
editProfileForm.addEventListener("submit", handleEditProfileSubmit);

enableValidation(settings);
