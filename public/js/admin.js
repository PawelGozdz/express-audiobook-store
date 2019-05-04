
const deleteButtons = document.querySelectorAll('form button');

function deleteAudiobook(e) {
  const btn = e.target;
  const prodId = btn.parentNode.querySelector('[name=audiobookId').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf').value;
  const audiobookCard = btn.closest('article');

  fetch(`/admin/audiobook/${prodId}`, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
    .then(result => result.json())
    .then((data) => {
      audiobookCard.parentNode.removeChild(audiobookCard);
    })
    .catch((err) => {
      console.log(err);
    });
}

// Listeners
deleteButtons.forEach(btn => btn.addEventListener('click', deleteAudiobook));
