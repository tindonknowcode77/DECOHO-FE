let confirmationOpen = false;

/** Shared confirmation for destructive admin actions. Escape and Cancel never delete. */
export function confirmDelete(message: string): Promise<boolean> {
  if (typeof document === "undefined" || confirmationOpen) return Promise.resolve(false);
  confirmationOpen = true;
  return new Promise((resolve) => {
    const previousFocus = document.activeElement;
    const dialog = document.createElement("dialog");
    dialog.className = "m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[#e5dfd2] bg-white p-6 text-[#17211b] shadow-2xl backdrop:bg-black/50";
    dialog.setAttribute("aria-labelledby", "admin-delete-title");
    dialog.setAttribute("aria-describedby", "admin-delete-description");
    const title = document.createElement("h2");
    title.id = "admin-delete-title";
    title.className = "text-xl font-bold";
    title.textContent = "Bạn có chắc muốn xóa?";
    const description = document.createElement("p");
    description.id = "admin-delete-description";
    description.className = "mt-3 whitespace-pre-wrap text-sm leading-6 text-[#687069]";
    description.textContent = message;
    const actions = document.createElement("div");
    actions.className = "mt-6 flex justify-end gap-3";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "Hủy";
    cancel.className = "rounded-lg border border-[#dcd5c3] px-5 py-2.5 font-bold focus-visible:outline-2";
    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.textContent = "Xác nhận xóa";
    confirm.className = "rounded-lg bg-red-700 px-5 py-2.5 font-bold text-white hover:bg-red-800 focus-visible:outline-2";
    actions.append(cancel, confirm);
    dialog.append(title, description, actions);
    document.body.append(dialog);
    let settled = false;
    function finish(approved: boolean) {
      if (settled) return;
      settled = true;
      dialog.remove();
      confirmationOpen = false;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
      resolve(approved);
    }
    cancel.onclick = () => finish(false);
    confirm.onclick = () => finish(true);
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); finish(false); });
    dialog.addEventListener("close", () => finish(false));
    try { dialog.showModal(); cancel.focus(); }
    catch { finish(false); }
  });
}
