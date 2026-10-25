// Inserisce nel contenitore indicato: link alla homepage, stato di sincronizzazione, email ed Esci.
// Uso: UserBar.mount(document.getElementById("userbar"), user)
window.UserBar = {
  mount(el, user) {
    if (!el) return;
    const label = { sincronizzato: "Salvato", salvataggio: "Salvataggio…", offline: "Offline: salvato sul dispositivo", errore: "Errore di salvataggio, riprovo" };
    el.classList.add("userbar");
    el.innerHTML =
      `<a class="home" href="${window.Auth.homeUrl()}">← Tutti i siti</a>` +
      `<span class="sync" data-s="sincronizzato" aria-live="polite">Salvato</span>` +
      `<span class="who"></span>` +
      `<button type="button" class="linkbtn out">Esci</button>`;
    el.querySelector(".who").textContent = user.email;
    el.querySelector(".out").onclick = () => window.Auth.signOut();
    const s = el.querySelector(".sync");
    window.AppStore.onStatus((st) => { s.dataset.s = st; s.textContent = label[st] || st; });
  }
};
