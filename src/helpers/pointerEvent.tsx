'use client'

import { PointerEventHandler } from "react";

export const stopPropagationHandler:PointerEventHandler = (e) => {
  e.stopPropagation();
}