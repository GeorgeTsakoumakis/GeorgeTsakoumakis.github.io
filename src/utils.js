export function displayDialog(text, onDisplayEnd) {
  const dialogUI = document.getElementById("textbox-container");
  const dialog = document.getElementById("dialog");

  dialogUI.style.display = "block";

  let index = 0;
  let currentText = "";

  const intervalRef = setInterval(() => {
    if (index < text.length) {
      currentText += text[index];
      dialog.innerHTML = currentText;
      index++;
      return;
    }

    clearInterval(intervalRef);
  }, 15); // 15ms per character

  const closeBtn = document.getElementById("close");

  function onCloseButtonClick() {
    onDisplayEnd();
    dialogUI.style.display = "none";
    dialog.innerHTML = "";
    clearInterval(intervalRef);
    closeBtn.removeEventListener("click", onCloseButtonClick);
  }

  closeBtn.addEventListener("click", onCloseButtonClick);
}

export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  if (resizeFactor < 1) {
    k.camScale(k.vec2(1));
    return;
  }
  k.camScale(k.vec2(1.5));
}
