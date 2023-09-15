function displayNotes() {
    const notesContainer = document.getElementById("notesContainer");
    notesContainer.innerHTML = "";
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.forEach(function (note) {
        const paragraph = document.createElement("p");
        paragraph.textContent = note;
        notesContainer.appendChild(paragraph);
    });
    const lastRetrievedTime = localStorage.getItem("lastRetrievedTime") || "N/A";
    document.getElementById("lastRetrievedTime").innerText = lastRetrievedTime;
}

function retrieveNotes() {
    displayNotes();
    const currentTime = new Date().toLocaleTimeString();
    localStorage.setItem("lastRetrievedTime", currentTime);
}

function goToIndex() {
    window.location.href = "index.html";
}

retrieveNotes()
var run =  setInterval(() => {
    retrieveNotes()
}, 2000);