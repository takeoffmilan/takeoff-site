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

// ============================================================
// TAKEOFF — DARK LANDING INTERACTIONS (S1-S10 + FAQ)
// ============================================================

// ===== S1 — Cost counter (totale animato) =====
const costCounter = document.querySelector('[data-cost-counter]')
const costCards = document.querySelectorAll('[data-cost]')
if (costCounter && costCards.length) {
  let revealed = 0
  let target = 0
  let current = 0
  const animate = () => {
    current += (target - current) * 0.12
    costCounter.textContent = Math.round(current * 12).toLocaleString('it-IT')
    requestAnimationFrame(animate)
  }
  animate()
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1'
        revealed += parseFloat(entry.target.dataset.cost || 0)
        target = revealed
        io.unobserve(entry.target)
      }
    })
  }, { threshold: 0.4 })
  costCards.forEach((c) => io.observe(c))
}

// ===== S2 — Calculator =====
;(function() {
  const $ = (s) => document.querySelector(s)
  const revenue = $('#calcRevenue')
  const years = $('#calcYears')
  const apps = $('#calcApps')
  const commission = $('#calcCommission')
  const customPlatform = $('#calcCustomPlatform')
  const customField = document.querySelector('.tk-calc-field-custom')
  const tabs = document.querySelectorAll('.tk-calc-tab')
  if (!revenue) return

  let activePlatform = 29

  const fmt = (n) => Math.round(n).toLocaleString('it-IT')

  const setFill = (input) => {
    const pct = ((input.value - input.min) / (input.max - input.min)) * 100
    input.style.setProperty('--fill', pct + '%')
  }

  const update = () => {
    const r = parseInt(revenue.value, 10)
    const y = parseInt(years.value, 10)
    const a = parseInt(apps.value, 10)
    const c = parseInt(commission.value, 10) / 10 // 0-30 => 0-3%

    const platformCost = activePlatform * 12 * y
    const appCost = a * 12 * y
    const commissionCost = r * (c / 100) * y
    const total = platformCost + appCost + commissionCost
    const saving = total

    document.querySelector('[data-out="revenue"]').textContent = '€' + fmt(r)
    document.querySelector('[data-out="years"]').textContent = y + (y === 1 ? ' anno' : ' anni')
    document.querySelector('[data-out="apps"]').textContent = '€' + a + '/mese'
    document.querySelector('[data-out="commission"]').textContent = c.toFixed(1) + '%'
    if (customPlatform) document.querySelector('[data-out="custom-platform"]').textContent = '€' + customPlatform.value
    document.querySelector('[data-result-years]').textContent = y
    document.querySelector('[data-calc-result-big]').textContent = fmt(total)
    document.querySelector('[data-calc-saving]').textContent = '€' + fmt(saving)
    document.querySelector('[data-bd-platform]').textContent = '€' + fmt(platformCost)
    document.querySelector('[data-bd-apps]').textContent = '€' + fmt(appCost)
    document.querySelector('[data-bd-commission]').textContent = '€' + fmt(commissionCost)

    ;[revenue, years, apps, commission, customPlatform].filter(Boolean).forEach(setFill)
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'))
      tab.classList.add('is-active')
      const isCustom = tab.dataset.platform === 'custom'
      if (customField) customField.hidden = !isCustom
      if (isCustom && customPlatform) {
        activePlatform = parseInt(customPlatform.value, 10)
      } else {
        activePlatform = parseInt(tab.dataset.platformMonthly || 29, 10)
      }
      update()
    })
  })
  ;[revenue, years, apps, commission, customPlatform].filter(Boolean).forEach((el) => {
    el.addEventListener('input', () => {
      if (el === customPlatform) activePlatform = parseInt(el.value, 10)
      update()
    })
  })
  update()
})()

// ===== S3 — Hover Expand Gallery =====
;(function() {
  const cards = document.querySelectorAll('[data-expand-card]')
  cards.forEach((card) => {
    const activate = () => {
      cards.forEach((c) => { c.classList.remove('is-active'); c.setAttribute('aria-selected', 'false') })
      card.classList.add('is-active')
      card.setAttribute('aria-selected', 'true')
    }
    card.addEventListener('mouseenter', activate)
    card.addEventListener('click', activate)
    card.addEventListener('focus', activate)
  })
})()

// ===== S4 — Stack Orbit =====
;(function() {
  const nodes = document.querySelectorAll('[data-orbit-node]')
  const detail = document.querySelector('[data-orbit-detail]')
  if (!detail || !nodes.length) return
  const title = detail.querySelector('[data-detail-title]')
  const desc = detail.querySelector('[data-detail-desc]')
  const data = {
    cloudflare: ['Cloudflare', 'Hosting veloce, scalabile e stabile. Edge network globale, SSL automatico, zero downtime.'],
    github: ['GitHub', 'Codice versionato e controllabile. Ogni cambio è tracciato, ogni rollback è un click.'],
    stripe: ['Stripe', 'Pagamenti integrabili dove servono. Carte, Apple Pay, abbonamenti, link di pagamento.'],
    ga: ['Google Analytics', 'Dati chiari su visite, conversioni e comportamento utente in tempo reale.'],
    meta: ['Meta Pixel', 'Tracciamento campagne Facebook e Instagram. Audience custom e retargeting.'],
    whatsapp: ['WhatsApp', 'Contatto diretto e immediato. Click-to-chat con messaggio precompilato.'],
    brevo: ['Brevo / Klaviyo', 'Email marketing e automazioni. Newsletter, drip, segmentazione comportamentale.'],
    openai: ['OpenAI', 'Automazioni AI dove servono: generazione contenuti, classificazione, smart search.']
  }
  nodes.forEach((n) => {
    n.addEventListener('click', () => {
      nodes.forEach((x) => x.classList.remove('is-active'))
      n.classList.add('is-active')
      const id = n.dataset.nodeId
      if (data[id]) { title.textContent = data[id][0]; desc.textContent = data[id][1] }
    })
    n.addEventListener('mouseenter', () => {
      const id = n.dataset.nodeId
      if (data[id]) { title.textContent = data[id][0]; desc.textContent = data[id][1] }
    })
  })
})()

// ===== S5 — CMS Demo =====
;(function() {
  const actions = document.querySelectorAll('[data-cms-action]')
  const toast = document.querySelector('[data-cms-toast]')
  const preview = document.querySelector('[data-cms-preview]')
  const image = document.querySelector('[data-cms-target="image"]')

  const showToast = () => {
    if (!toast) return
    toast.hidden = false
    toast.classList.add('show')
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.hidden = true, 300) }, 1500)
  }

  actions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.cmsAction
      const value = btn.dataset.value
      if (action === 'image') {
        image?.classList.toggle('is-b', value === 'img-b')
        image?.classList.add('tk-cms-edited')
        setTimeout(() => image?.classList.remove('tk-cms-edited'), 1000)
      } else {
        const target = preview?.querySelector(`[data-cms-text="${action}"]`)
        if (target) {
          target.textContent = value
          const wrapper = target.closest('[data-cms-target]') || target
          wrapper.classList.add('tk-cms-edited')
          setTimeout(() => wrapper.classList.remove('tk-cms-edited'), 1000)
        }
      }
      showToast()
    })
  })
})()

// ===== S6 — Comparison years toggle =====
;(function() {
  const yearBtns = document.querySelectorAll('.tk-comp-year')
  const compCards = document.querySelectorAll('[data-comp-card]')
  const yearLabels = document.querySelectorAll('[data-comp-years]')
  const calc = (monthly, years) => {
    const total = monthly * 12 * years + 200 * 12 * years // platform + apps avg
    return '€' + Math.round(total).toLocaleString('it-IT')
  }
  yearBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      yearBtns.forEach((b) => b.classList.remove('is-active'))
      btn.classList.add('is-active')
      const y = parseInt(btn.dataset.years, 10)
      yearLabels.forEach((l) => l.textContent = y)
      compCards.forEach((card) => {
        const monthly = parseInt(card.dataset.monthly, 10)
        const amountEl = card.querySelector('[data-comp-amount]')
        if (amountEl) amountEl.textContent = calc(monthly, y)
      })
    })
  })
})()

// ===== S7 — Configurator =====
;(function() {
  const chips = document.querySelectorAll('[data-config-chip]')
  const modulesList = document.querySelector('[data-config-modules]')
  const title = document.querySelector('[data-config-title]')
  const sub = document.querySelector('[data-config-sub]')
  const url = document.querySelector('[data-config-url]')
  const titles = {
    ristorante: ['Esperienza che racconta una storia', 'Menù, prenotazioni e ambiente in un sito che funziona di sera come di pranzo.'],
    studio: ['Professionalità che si vede dal primo click', 'Servizi chiari, FAQ, prenotazione consulenza e contenuti che ti posizionano.'],
    personal: ['Il tuo brand, ovunque ti cerchino', 'Bio, portfolio, social hub e contatto diretto in un sito che sembra te.'],
    landing: ['Convertire, non solo presentare', 'Hero conversion-focused, pricing, FAQ e tracking pronto al lancio.'],
    portfolio: ['I tuoi lavori al centro', 'Progetti, case study e categorie navigabili in un layout cinematic.'],
    catalogo: ['Catalogo che vende, anche offline', 'Schede prodotto, filtri, listino PDF e richiesta info diretta.'],
    evento: ['Dal countdown al biglietto', 'Programma, speaker, sponsor e booking in una landing memorabile.'],
    scuola: ['Iscrizioni che funzionano davvero', 'Corsi, docenti, pagamenti e calendario nel posto giusto.'],
    local: ['Trovato dai clienti vicini, ricordato dai lontani', 'Servizi, recensioni e mappa pronti per chi cerca su Google.']
  }
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'))
      chip.classList.add('is-active')
      const id = chip.dataset.configChip
      const mods = chip.dataset.modules?.split('|') || []
      if (modulesList) {
        modulesList.innerHTML = ''
        mods.forEach((m, i) => {
          const li = document.createElement('li')
          li.textContent = m
          li.style.animationDelay = (i * 0.04) + 's'
          modulesList.appendChild(li)
        })
      }
      if (titles[id]) {
        title.textContent = titles[id][0]
        sub.textContent = titles[id][1]
      }
      if (url) url.textContent = 'takeoff.it / ' + id
    })
  })
})()

// ===== S8 — Vetrina nav =====
;(function() {
  const rail = document.querySelector('[data-vetrina-rail]')
  const prev = document.querySelector('[data-vetrina-prev]')
  const next = document.querySelector('[data-vetrina-next]')
  if (!rail) return
  const scrollAmount = () => Math.min(rail.clientWidth * 0.8, 720)
  prev?.addEventListener('click', () => rail.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }))
  next?.addEventListener('click', () => rail.scrollBy({ left: scrollAmount(), behavior: 'smooth' }))
})()

// ===== S9 — Process timeline =====
;(function() {
  const steps = document.querySelectorAll('[data-process-step]')
  const progress = document.querySelector('[data-process-progress]')
  const content = document.querySelector('[data-process-content]')
  const data = [
    ['01 — Brief', 'Capiamo cosa serve, davvero.', 'Ci dici cosa vendi, a chi parli e che obiettivo deve avere il sito. Poco modulo, molto ascolto.'],
    ['02 — Demo', 'Prima vedi, poi decidi.', 'Prepariamo una prima direzione visiva concreta, così non devi immaginare il risultato.'],
    ['03 — Design', 'Disegnato intorno al tuo brand.', 'Sezioni, contenuti, animazioni e struttura in base al tono giusto per te.'],
    ['04 — CMS', 'Lo gestisci tu, senza dipendere.', 'Rendiamo modificabili testi, immagini e contenuti principali. Niente call per cambiare un titolo.'],
    ['05 — Online', 'Veloce, stabile, scalabile.', 'Pubblichiamo su Cloudflare edge network. SSL, CDN, zero canoni di hosting.'],
    ['06 — Ottimizzazione', 'Misurato e migliorato.', 'Controlliamo performance, tracking, SEO base e conversioni reali.']
  ]
  steps.forEach((step) => {
    step.addEventListener('click', () => {
      steps.forEach((s) => s.classList.remove('is-active'))
      step.classList.add('is-active')
      const idx = parseInt(step.dataset.processStep, 10)
      if (progress) progress.style.transform = `translateX(calc(${idx * 100}% + ${idx * 8}px))`
      if (content && data[idx]) {
        content.innerHTML = `<span class="tk-process-detail-step">${data[idx][0]}</span><h3>${data[idx][1]}</h3><p>${data[idx][2]}</p>`
      }
    })
  })
})()

// ===== S10 — Audit form =====
;(function() {
  const monthly = document.querySelector('#auditMonthly')
  const monthlyOut = document.querySelector('[data-audit-monthly]')
  const savingOut = document.querySelector('[data-audit-saving]')
  if (!monthly) return
  const update = () => {
    const m = parseInt(monthly.value, 10)
    monthlyOut.textContent = '€' + m + '/mese'
    savingOut.textContent = '€' + (m * 12).toLocaleString('it-IT')
  }
  monthly.addEventListener('input', update)
  update()
  document.querySelector('#auditForm')?.addEventListener('submit', (e) => {
    e.preventDefault()
    alert('Grazie! Ti contattiamo entro 24h con la demo e la stima del risparmio.')
  })
})()

// ===== FAQ details = native, no JS needed =====
