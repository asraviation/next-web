"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function Portal({ children, container }) {
  const [mount, setMount] = useState(null);
  useEffect(() => setMount(container || document.body), [container]);
  if (!mount) return null;
  return createPortal(children, mount);
}
