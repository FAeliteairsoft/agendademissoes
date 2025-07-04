import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, doc, onSnapshot, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

let codinome = localStorage.getItem("codinome");
if (!codinome) {
  codinome = prompt("Digite seu codinome:");
  if (!codinome) codinome = "SemCodinome";
  localStorage.setItem("codinome", codinome);
}

const gameList = document.getElementById("game-list");
const modal = document.getElementById("modal");
const attendeesUL = document.getElementById("attendees");
document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");

onSnapshot(collection(db, "games"), (snap) => {
  gameList.innerHTML = "";
  snap.forEach((docSnap) => renderGameCard(docSnap));
});

function renderGameCard(gameDoc) {
  const g = gameDoc.data();
  const card = document.createElement("div");
  card.className = "border border-yellow-600 rounded-xl p-4";
  const attendeesRef = collection(gameDoc.ref, "attendees");

  onSnapshot(attendeesRef, (attSnap) => {
    const confirmed = attSnap.docs.map(d => d.id);
    const isMe = confirmed.includes(codinome);

    card.innerHTML = `
      <h3 class="text-xl font-bold">${g.title}</h3>
      <p>📅 ${g.date} às ${g.time}</p>
      <p>📍 ${g.location}</p>
      <p>🧭 Encontro: ${g.meetup}</p>
      <p class="mt-2">${g.mission || ""}</p>

      <button class="mt-4 w-full py-2 rounded-lg font-bold
        ${isMe ? 'bg-red-600' : 'bg-green-600'}" 
        id="btn-${gameDoc.id}">
        ${isMe ? 'Cancelar presença' : 'Confirmar presença'}
      </button>

      <button class="mt-2 text-sm underline" id="view-${gameDoc.id}">
        Ver confirmados (${confirmed.length})
      </button>
    `;

    card.querySelector(`#btn-${gameDoc.id}`).onclick = () =>
      togglePresence(gameDoc.ref, isMe);
    card.querySelector(`#view-${gameDoc.id}`).onclick = () =>
      openModal(confirmed);
  });

  gameList.appendChild(card);
}

async function togglePresence(gameRef, alreadyThere) {
  const attRef = doc(collection(gameRef, "attendees"), codinome);
  if (alreadyThere) {
    await deleteDoc(attRef);
  } else {
    await setDoc(attRef, { confirmed: true });
  }
}

function openModal(list) {
  attendeesUL.innerHTML = list.map(c => `<li class="pl-2">✅ ${c}</li>`).join("");
  modal.classList.remove("hidden");
}
