/**
 * TakeOff — Main JS v0.2 (rebrand)
 * Lenis smooth + GSAP ScrollTrigger + counter + calculator + FAQ
 */

import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ===== LENIS SMOOTH SCROLL =====
let lenis
if (!prefersReducedMotion) {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })
  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
  lenis.on('scroll', ScrollTrigger.update)
}

// ===== Anchor smooth scroll =====
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href')
    if (id === '#' || id === '#top') {
      e.preventDefault()
      lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const target = document.querySelector(id)
    if (target) {
      e.preventDefault()
      lenis ? lenis.scrollTo(target, { offset: -80 }) : target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
})

// ===== HEADER SCROLL STATE =====
const header = document.querySelector('[data-header]')
const onScroll = () => {
  if (window.scrollY > 30) header?.classList.add('scrolled')
  else header?.classList.remove('scrolled')
}
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

// ===== SCROLL PROGRESS BAR =====
const progressEl = document.querySelector('[data-progress]')
const updateProgress = () => {
  if (!progressEl) return
  const max = document.documentElement.scrollHeight - window.innerHeight
  const pct = Math.min(100, (window.scrollY / max) * 100)
  progressEl.style.width = pct + '%'
}
window.addEventListener('scroll', updateProgress, { passive: true })
updateProgress()

// ===== REVEAL (IntersectionObserver) =====
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed', 'in')
        revealObs.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
)
document.querySelectorAll('[data-reveal]').forEach((el) => revealObs.observe(el))

// ===== HERO TITLE STAGGER (split by word) =====
if (!prefersReducedMotion) {
  const heroTitle = document.querySelector('[data-split]')
  if (heroTitle) {
    const html = heroTitle.innerHTML
    // wrap words in spans (only for non-tag content)
    const wrapped = html.replace(/(>|^)([^<]+)(<|$)/g, (m, p1, words, p3) => {
      const out = words
        .split(' ')
        .map((w) => w ? `<span class="word">${w}</span>` : '')
        .join(' ')
      return `${p1}${out}${p3}`
    })
    heroTitle.innerHTML = wrapped
    gsap.from('[data-split] .word', {
      y: '110%',
      opacity: 0,
      duration: 0.9,
      stagger: 0.05,
      ease: 'power3.out',
      delay: 0.2,
    })
    // ensure word elements have overflow:hidden parent visual
    const style = document.createElement('style')
    style.textContent = `.word { display: inline-block; }`
    document.head.appendChild(style)
  }
}

// ===== STICKY COUNTER (problem section) =====
if (!prefersReducedMotion) {
  gsap.utils.toArray('[data-counter-row]').forEach((row, i) => {
    gsap.to(row, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: row,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    })
  })
}

// ===== COUNTER ANIMATION ON SCROLL =====
const animateCounter = (el, to) => {
  const obj = { val: 0 }
  gsap.to(obj, {
    val: to,
    duration: 2,
    ease: 'power2.out',
    onUpdate: () => {
      const v = Math.round(obj.val)
      el.textContent = v >= 1000 ? v.toLocaleString('it-IT') + '+' : v + (el.dataset.suffix || '')
    },
  })
}

document.querySelectorAll('[data-counter-to]').forEach((el) => {
  const to = parseInt(el.dataset.counterTo, 10)
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(el, to)
          io.unobserve(el)
        }
      })
    },
    { threshold: 0.5 }
  )
  io.observe(el)
})

// ===== CALCULATOR =====
const calcRev = document.querySelector('#calcRevenue')
const calcYears = document.querySelector('#calcYears')
const labelRev = document.querySelector('[data-calc-revenue]')
const labelYears = document.querySelector('[data-calc-years]')
const result = document.querySelector('[data-calc-result]')

const formatEUR = (n) =>
  '€' + Math.round(n).toLocaleString('it-IT')

const updateCalculator = () => {
  if (!calcRev || !calcYears || !result) return
  const revenue = parseInt(calcRev.value, 10)
  const years = parseInt(calcYears.value, 10)
  // Costo Shopify Basic: 29€/mese + 2% commissioni + 50€/mese app medie
  const shopifyMonthly = 29 + 50
  const shopifyTransactionFees = revenue * 0.02
  const yearlyShopify = shopifyMonthly * 12 + shopifyTransactionFees
  const totalShopify = yearlyShopify * years
  const totalTakeoff = 10 * years // dominio
  const savings = totalShopify - totalTakeoff

  labelRev.textContent = formatEUR(revenue)
  labelYears.textContent = years + (years === 1 ? ' anno' : ' anni')
  result.textContent = formatEUR(savings)
}

calcRev?.addEventListener('input', updateCalculator)
calcYears?.addEventListener('input', updateCalculator)
updateCalculator()

// ===== FAQ ACCORDION =====
document.querySelectorAll('[data-faq]').forEach((item) => {
  const q = item.querySelector('.faq-q')
  q?.addEventListener('click', () => {
    item.classList.toggle('open')
  })
})

// ===== MOBILE MENU =====
const menuToggle = document.querySelector('[data-menu-toggle]')
menuToggle?.addEventListener('click', () => {
  document.querySelector('.main-nav')?.classList.toggle('open')
  menuToggle.classList.toggle('open')
})

// ===== BACK TO TOP =====
const backTop = document.querySelector('[data-back-to-top]')
window.addEventListener(
  'scroll',
  () => {
    if (window.scrollY > 600) backTop?.classList.add('visible')
    else backTop?.classList.remove('visible')
  },
  { passive: true }
)
backTop?.addEventListener('click', () => {
  lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' })
})

// ===== FOOTER YEAR =====
const year = document.querySelector('#year')
if (year) year.textContent = new Date().getFullYear()

// ===== STARTUP LOG =====
console.log(
  '%cTakeOff%c · Zero abbonamenti. Per sempre.',
  'font-weight:700;background:linear-gradient(120deg,#ff66c4,#ffde59);-webkit-background-clip:text;color:transparent;font-size:14px;',
  'color:#666;font-size:11px;'
)

// ===============================
// SCROLL HERO — Liquid Morph progress
// ===============================
const scrollHero = document.querySelector('[data-scroll-hero]')
if (scrollHero && !prefersReducedMotion) {
  const track = scrollHero.querySelector('.sh-track')
  const labels = scrollHero.querySelectorAll('.sh-progress-label')

  // smoothed progress
  let target = 0
  let current = 0
  const LERP = 0.18

  const updateProgress = () => {
    const rect = track.getBoundingClientRect()
    const total = rect.height - window.innerHeight
    const scrolled = -rect.top
    target = Math.max(0, Math.min(1, scrolled / total))
  }
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress)
  updateProgress()

  // each stage occupies 0.25 of progress
  const stageProgress = (p, stageIdx) => {
    // stageIdx 0..3, returns 0..1 within that quarter (with fade overlap)
    const start = stageIdx * 0.25
    const end = start + 0.25
    if (p < start - 0.05) return 0
    if (p > end + 0.05) return stageIdx === 3 ? 1 : 0
    if (p < start) return (p - (start - 0.05)) / 0.05 // fade in
    if (p > end) return 1 - (p - end) / 0.05 // fade out (unless last)
    return 1
  }

  const tick = () => {
    current += (target - current) * LERP
    const p = current

    scrollHero.style.setProperty('--p', p.toFixed(3))
    scrollHero.style.setProperty('--stage1', stageProgress(p, 0).toFixed(3))
    scrollHero.style.setProperty('--stage2', stageProgress(p, 1).toFixed(3))
    scrollHero.style.setProperty('--stage3', stageProgress(p, 2).toFixed(3))
    // stage 4 (logo) stays visible to the end
    const s4 = p < 0.7 ? 0 : Math.min(1, (p - 0.7) / 0.25)
    scrollHero.style.setProperty('--stage4', s4.toFixed(3))

    // active label
    const activeIdx = Math.min(3, Math.floor(p * 4))
    labels.forEach((l, i) => l.classList.toggle('active', i === activeIdx))

    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
