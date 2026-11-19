# ReLoop — Waste Exchange & Environmental Mapping Platform

A web platform for Myanmar that turns unwanted materials into useful resources. People sell, give away or ask for recyclable materials (contacts are shared only after a request is accepted), report dumped waste on a public map, and learn how to reuse or recycle each material. Built as the MVP for the hackathon proposal *Technology for Environmental Sustainability & Disaster Resilience*.

> မလိုချင်သော ပစ္စည်းများကို အသုံးဝင်သော အရင်းအမြစ်များအဖြစ် ပြောင်းလဲပေးသည့် မြန်မာနိုင်ငံအတွက် ဝဘ်ပလက်ဖောင်း — စွန့်ပစ်ပစ္စည်း ဈေးကွက်၊ အမှိုက်မြေပုံနှင့် ပြန်သုံးနည်းများ။ English နှင့် မြန်မာ နှစ်ဘာသာဖြင့် အသုံးပြုနိုင်သည်။

## Repository

| Folder | Contents |
| --- | --- |
| [`web/`](web/) | The Next.js 16 app (Tailwind CSS 4, shadcn/ui, Leaflet, English + Burmese UI) |
| [`docs/`](docs/) | Project documentation PDFs — [English](docs/ReLoop_Project_Documentation_EN.pdf), [မြန်မာ](docs/ReLoop_Project_Documentation_MY.pdf) — and their HTML sources |
| [`source/`](source/) | The hackathon proposal and planning files |

## Run locally

```bash
cd web
npm install
npm run dev   # http://localhost:3000
```

The MVP runs on demo data (no database yet). Switch demo users from the account menu; changes reset when the server restarts.
