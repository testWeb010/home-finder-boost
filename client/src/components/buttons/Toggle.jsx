import { useState } from "react";
import './Toggle.css'

function Toggle() {
  const [on, setOnState] = useState(false);
  const toggle = () => setOnState((o) => !o);
  return (
    <button class={on ? "on" : "off"} on={on} onClick={toggle}>
      <span class="pin" />
    </button>
  );
}

export default Toggle