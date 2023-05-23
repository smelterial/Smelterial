import { writable, type Writable } from "svelte/store";

export function sequentialKeys(sequence: KeyboardEvent["key"][]) {
  let pressed: KeyboardEvent["key"][] = [];

  const resultStore = writable<boolean>(false) as Writable<boolean> & {
    persist: Writable<boolean>;
  };

  resultStore.persist = writable<boolean>(false);
  const unsubscribePersist = resultStore.subscribe((value) => {
    if (value) {
      resultStore.persist.set(true);
      unsubscribePersist();
    }
  });

  window.addEventListener("keydown", (e) => {
    do {
      if (e.key === sequence[pressed.length] && pressed.every((key, i) => key === sequence[i])) {
        pressed.push(e.key);
        break;
      } else pressed.shift();
    } while (pressed.length);

    resultStore.set(
      pressed.length === sequence.length && pressed.every((key, i) => key === sequence[i]),
    );
  });

  return resultStore;
}
