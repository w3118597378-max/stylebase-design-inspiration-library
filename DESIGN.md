---
name: Stylebase
description: 本地视觉参考资料库的手绘工作台界面。
colors:
  paper: "#fffdf6"
  paper-raised: "#fffefa"
  ink: "#191715"
  cobalt: "#135dff"
  sunflower: "#ffd51d"
  coral: "#e74735"
  leaf: "#16734c"
typography:
  body:
    fontFamily: "Microsoft YaHei UI, Microsoft YaHei, DengXian, Noto Sans SC, Segoe UI, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: "7px"
  frame: "13px"
spacing:
  compact: "8px"
  standard: "18px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "8px 13px"
---

## Overview

Stylebase is a bright paper workbench: authentic reference images are the visual protagonist, while a small ink-and-wax-crayon illustration system gives navigation, empty states, and Codex status a friendly hand-made voice.

## Colors

Use ink for every structural rule, cobalt for direct action and current selection, sunflower for the active navigation sticker, leaf for completion, and coral for recoverable failures. Never make status color the sole signal.

## Typography

Use the system Chinese sans-serif stack for all task content. The compact black wordmark is reserved for the brand only; no decorative hand lettering is used for controls or metadata.

## Layout

Desktop is a three-column operating desk: illustrated rail, dense five-column asset sheet, and binder-like inspector, with a persistent horizontal Codex queue below. At 920px, the navigation becomes a horizontal strip and the inspector becomes a full-screen layer. At 640px, the asset sheet becomes two columns.

## Elevation & Depth

Surfaces use strong ink outlines with only small soft offset shadows. Paper texture is subtle and must never compete with image content.

## Shapes

Controls are near-square with lightly irregular 4–13px corners. Active navigation is a dashed yellow sticker. The selected asset has a cobalt double ring; batch selection is a distinct dashed outline.

## Components

Navigation uses decorative PNG illustrations with empty alt text. The inspector has a repeating binder-ring edge. Queue cards always retain thumbnail, written phase, percentage/progress bar, error detail when present, and a distinct character for waiting, analysing, completed, or failed work.

## Do's and Don'ts

Do keep APIs, DOM IDs, keyboard interactions, and mobile inspector behaviour untouched. Do keep images unfiltered. Do use the shared illustration assets rather than emoji or generic iconography. Do not replace this composition with rounded SaaS cards, gradients, glass, or a simple recolor of the previous interface.
