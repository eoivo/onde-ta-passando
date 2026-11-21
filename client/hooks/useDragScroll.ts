"use client";

import { useEffect, type RefObject } from "react";

/**
 * Arrastar com o mouse (desktop) para rolar um container horizontal.
 * Touch continua usando o scroll nativo. Cliques após um arrasto são suprimidos.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let moved = false;
    let justDragged = false;
    let startX = 0;
    let startScroll = 0;
    const THRESHOLD = 5;

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };

    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > THRESHOLD) {
        moved = true;
        el.style.scrollSnapType = "none";
        el.style.cursor = "grabbing";
        el.style.userSelect = "none";
      }
      if (moved) {
        e.preventDefault();
        el.scrollLeft = startScroll - dx;
      }
    };

    const end = () => {
      if (!isDown) return;
      isDown = false;
      if (moved) {
        el.style.scrollSnapType = "";
        el.style.cursor = "";
        el.style.userSelect = "";
        // O click dispara logo após o mouseup; depois disso libera
        justDragged = true;
        setTimeout(() => {
          justDragged = false;
        }, 0);
      }
      moved = false;
    };

    // Suprime o clique logo após arrastar. Registrado na window (captura) para
    // rodar ANTES de listeners globais (ex.: NavigationProvider, que liga o loading).
    const onClickCapture = (e: MouseEvent) => {
      if (justDragged && e.target instanceof Node && el.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    // Evita arrastar imagens/links nativamente
    const onDragStart = (e: DragEvent) => e.preventDefault();

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", end);
    window.addEventListener("click", onClickCapture, true);
    el.addEventListener("dragstart", onDragStart);

    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", end);
      window.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("dragstart", onDragStart);
    };
  }, [ref]);
}
