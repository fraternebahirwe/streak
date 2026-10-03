// Add / edit habit sheet.
(function () {
  const { $, esc } = App;
  const dialog = $("#habitDialog");
  let editingId = null, emoji = App.EMOJIS[0], color = App.COLORS[5], target = 7;

  function paint() {
    $("#hEmojis").innerHTML = App.EMOJIS.map(e => '<button type="button" data-e="' + e + '" class="' + (e === emoji ? "sel" : "") + '">' + e + "</button>").join("");
    $("#hColors").innerHTML = App.COLORS.map(c => '<button type="button" data-c="' + c + '" style="background:' + c + '" class="' + (c === color ? "sel" : "") + '" aria-label="Colour ' + c + '"></button>').join("");
    $("#hTarget").innerHTML = [1, 2, 3, 4, 5, 6, 7].map(n => '<button type="button" data-t="' + n + '" class="' + (n === target ? "sel" : "") + '">' + n + "</button>").join("");
  }

  App.openEditor = function (id) {
    editingId = id || null;
    const h = id ? Store.habit(id) : null;
    $("#habitDialogTitle").textContent = h ? "Edit habit" : "New habit";
    $("#hName").value = h ? h.name : "";
    emoji = h ? h.emoji : App.EMOJIS[Math.floor(Math.random() * App.EMOJIS.length)];
    color = h ? h.color : App.COLORS[Math.floor(Math.random() * App.COLORS.length)];
    target = h ? h.target : 7;
    $("#hDelete").hidden = !h;
    paint();
    dialog.showModal();
    if (!h) $("#hName").focus();
  };

  dialog.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.e) emoji = b.dataset.e;
    else if (b.dataset.c) color = b.dataset.c;
    else if (b.dataset.t) target = Number(b.dataset.t);
    else return;
    paint();
  });

  $("#hCancel").addEventListener("click", () => dialog.close());

  $("#habitForm").addEventListener("submit", e => {
    const name = $("#hName").value.trim();
    if (!name) { e.preventDefault(); $("#hName").focus(); return; }
    if (editingId) Store.updateHabit(editingId, { name, emoji, color, target });
    else Store.addHabit({ name, emoji, color, target });
  });

  $("#hDelete").addEventListener("click", () => {
    const id = editingId;
    dialog.close();
    if (App.closeDetail) App.closeDetail();
    const removed = Store.removeHabit(id);
    if (removed) App.toast("Deleted " + removed.habit.name, "Undo", () => Store.restoreHabit(removed), 6000);
  });
})();
