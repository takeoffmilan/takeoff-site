/**
 * TakeOff — Main JS v0.2 (rebrand)
 * Lenis smooth + GSAP ScrollTrigger + counter + calculator + FAQ
 */

import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const heroEl = document.querySelector('.hero')

// ===== HERO INTERACTION (vanilla, CSS variables) =====
if (heroEl) {
  if (prefersReducedMotion) {
    heroEl.classList.add('is-loaded')
  } else {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const state = {
      videoX: 0,
      videoY: 0,
      targetVideoX: 0,
      targetVideoY: 0,
      glowX: 50,
      glowY: 42,
      targetGlowX: 50,
      targetGlowY: 42,
      scroll: 0,
      targetScroll: 0,
      active: true,
    }

    requestAnimationFrame(() => heroEl.classList.add('is-loaded'))

    if (finePointer) {
      heroEl.addEventListener('pointermove', (event) => {
        const rect = heroEl.getBoundingClientRect()
        const nx = (event.clientX - rect.left) / rect.width - 0.5
        const ny = (event.clientY - rect.top) / rect.height - 0.5
        state.targetVideoX = -nx * 18
        state.targetVideoY = -ny * 14
        state.targetGlowX = (nx + 0.5) * 100
        state.targetGlowY = (ny + 0.5) * 100
      })
    }

    document.querySelectorAll('[data-hero-cta]').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect()
        button.style.setProperty('--cta-x', (((event.clientX - rect.left) / rect.width) * 100).toFixed(2) + '%')
        button.style.setProperty('--cta-y', (((event.clientY - rect.top) / rect.height) * 100).toFixed(2) + '%')
      })
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--cta-x', '50%')
        button.style.setProperty('--cta-y', '50%')
      })
    })

    const updateHeroScroll = () => {
      const rect = heroEl.getBoundingClientRect()
      state.active = rect.bottom > -80 && rect.top < window.innerHeight + 80
      state.targetScroll = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height * 0.82)))
    }

    const animateHero = () => {
      if (state.active) {
        state.videoX += (state.targetVideoX - state.videoX) * 0.06
        state.videoY += (state.targetVideoY - state.videoY) * 0.06
        state.glowX += (state.targetGlowX - state.glowX) * 0.055
        state.glowY += (state.targetGlowY - state.glowY) * 0.055
        state.scroll += (state.targetScroll - state.scroll) * 0.1

        heroEl.style.setProperty('--hero-video-x', state.videoX.toFixed(2) + 'px')
        heroEl.style.setProperty('--hero-video-y', state.videoY.toFixed(2) + 'px')
        heroEl.style.setProperty('--cursor-x', state.glowX.toFixed(2) + '%')
        heroEl.style.setProperty('--cursor-y', state.glowY.toFixed(2) + '%')
        heroEl.style.setProperty('--hero-scroll', state.scroll.toFixed(3))
      }
      requestAnimationFrame(animateHero)
    }

    window.addEventListener('scroll', updateHeroScroll, { passive: true })
    window.addEventListener('resize', updateHeroScroll)
    updateHeroScroll()
    animateHero()
  }
}

// ===== HERO VIDEO FADE LOOP =====
const heroVideo = document.querySelector('[data-hero-video]')
if (heroVideo && !prefersReducedMotion) {
  heroVideo.muted = true
  heroVideo.loop = true

  const fadeWindow = 0.5
  const renderVideoOpacity = () => {
    const duration = Number.isFinite(heroVideo.duration) ? heroVideo.duration : 0
    let opacity = 1

    if (heroVideo.currentTime < fadeWindow) {
      opacity = heroVideo.currentTime / fadeWindow
    } else if (duration && duration - heroVideo.currentTime < fadeWindow) {
      opacity = Math.max(0, (duration - heroVideo.currentTime) / fadeWindow)
    }

    heroVideo.style.opacity = opacity.toFixed(3)
    if (!heroVideo.paused && !heroVideo.ended) requestAnimationFrame(renderVideoOpacity)
  }

  const playHeroVideo = () => {
    heroVideo.currentTime = 0
    heroVideo.style.opacity = '0'
    heroVideo.play().then(() => requestAnimationFrame(renderVideoOpacity)).catch(() => {})
  }

  heroVideo.addEventListener('ended', () => {
    heroVideo.style.opacity = '0'
    window.setTimeout(playHeroVideo, 100)
  })

  if (heroVideo.readyState >= 2) playHeroVideo()
  else heroVideo.addEventListener('canplay', playHeroVideo, { once: true })
} else if (heroVideo) {
  heroVideo.style.opacity = '1'
}

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

// ===== HERO ENTRANCE =====
if (!prefersReducedMotion) {
  gsap.from('.site-header', {
    y: -24,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    delay: 0.1,
  })

  gsap.from('.hero-sub', {
    y: 24,
    opacity: 0,
    filter: 'blur(10px)',
    duration: 1,
    ease: 'power3.out',
    delay: 0.72,
  })

  gsap.from('.hero-actions .btn', {
    opacity: 0,
    filter: 'blur(12px)',
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    delay: 1.02,
    onComplete: () => gsap.set('.hero-actions .btn', { clearProps: 'filter' }),
  })

  gsap.from('.logo-track span', {
    y: 28,
    opacity: 0,
    scale: 0.86,
    filter: 'blur(8px)',
    duration: 0.85,
    stagger: 0.045,
    ease: 'power3.out',
    delay: 1.24,
  })
}

// ===== SCROLL MOTION =====
if (!prefersReducedMotion) {
  gsap.utils.toArray('main > section:not(.hero)').forEach((section) => {
    const introEls = section.querySelectorAll('.eyebrow, .section-title, .section-lead')
    if (introEls.length) {
      gsap.from(introEls, {
        y: 34,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 74%',
          once: true,
        },
      })
    }
  })

  gsap.utils.toArray('.solution-card, .feature-card, .step-card, .testi, .app-card, .comp-table, .calc-box, .proof-numbers > div').forEach((el, index) => {
    gsap.from(el, {
      y: 42,
      opacity: 0,
      scale: 0.98,
      filter: 'blur(10px)',
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true,
      },
      delay: (index % 3) * 0.03,
    })
  })
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
