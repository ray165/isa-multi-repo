function addNote(note_text="") {
    const contentContainer = document.getElementById("content-container");

    // Create a new div element to hold each note
    const noteDiv = document.createElement("div");
    noteDiv.className = "notes-container"

    // Create a textarea element for the note
    const textarea = document.createElement("textarea");
    textarea.className = "text-container"
    textarea.textContent = note_text

    // Create a remove button for the note
    const removeButton = document.createElement("button");
    removeButton.innerText = "Remove";
    removeButton.addEventListener('click', () => {
        contentContainer.removeChild(noteDiv);
        removeButton.remove();
    });

    // Append the textarea and remove button to the note's div
    noteDiv.appendChild(textarea);
    noteDiv.appendChild(removeButton);

    // Append the note's div to the notes container
    contentContainer.appendChild(noteDiv);

    // Save notes to localStorage
    saveNotesToLocalStorage();
}

function saveNotesToLocalStorage() {
    const notes = [];
    const textareas = document.querySelectorAll(".text-container");
    textareas.forEach(function (textarea) {
        notes.push(textarea.value);
    });
    const currentTime = new Date().toLocaleTimeString();
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("lastSavedTime", currentTime);
    document.getElementById("lastSavedTime").innerText = currentTime;
    console.info(notes)
}

function goToIndex() {
    window.location.href = "index.html";
}

function displayNotes() {
    const notesContainer = document.getElementById("content-container");
    notesContainer.innerHTML = ""; // removes all childs
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.forEach(function (note) {
        addNote(note)
    });
}

displayNotes()

var run =  setInterval(() => {
    saveNotesToLocalStorage()
}, 2000);