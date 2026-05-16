/**
 * TakeOff Milan — Main JS
 * - Lenis smooth scroll
 * - IntersectionObserver reveal-on-scroll
 * - Header scroll state
 * - Mobile menu toggle
 * - Contact form submit (Cloudflare Functions)
 * - Back to top button
 * - Footer year auto
 */

import Lenis from 'lenis'

// ===============================
// SMOOTH SCROLL (Lenis)
// ===============================
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// Anchor link smooth scroll integration
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href')
    if (targetId === '#' || targetId === '#top') {
      e.preventDefault()
      lenis.scrollTo(0)
      return
    }
    const target = document.querySelector(targetId)
    if (target) {
      e.preventDefault()
      lenis.scrollTo(target, { offset: -80 })
    }
  })
})

// ===============================
// HEADER SCROLL STATE
// ===============================
const header = document.querySelector('[data-header]')
const updateHeader = () => {
  if (window.scrollY > 30) {
    header?.classList.add('scrolled')
  } else {
    header?.classList.remove('scrolled')
  }
}
window.addEventListener('scroll', updateHeader, { passive: true })
updateHeader()

// ===============================
// REVEAL ON SCROLL (IntersectionObserver)
// ===============================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed', 'in')
        revealObserver.unobserve(entry.target)
      }
    })
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  }
)

document.querySelectorAll('[data-reveal]').forEach((el) => {
  revealObserver.observe(el)
})

// Services cards have separate class-based animation
document.querySelectorAll('.svc-card').forEach((el) => {
  revealObserver.observe(el)
})

// ===============================
// MOBILE MENU TOGGLE
// ===============================
const menuToggle = document.querySelector('[data-menu-toggle]')
const mainNav = document.querySelector('.main-nav')

menuToggle?.addEventListener('click', () => {
  mainNav?.classList.toggle('open')
  menuToggle.classList.toggle('open')
})

// ===============================
// CONTACT FORM SUBMIT
// ===============================
const contactForm = document.querySelector('#contactForm')
const formMessage = document.querySelector('#formMessage')

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault()

  const formData = new FormData(contactForm)
  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    service: formData.get('service'),
    message: formData.get('message'),
  }

  if (formMessage) {
    formMessage.textContent = 'Invio in corso...'
    formMessage.style.color = ''
  }

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (data.success) {
      if (formMessage) {
        formMessage.textContent = '✓ Messaggio inviato! Ti rispondiamo entro 24h.'
        formMessage.style.color = '#52ff9f'
      }
      contactForm.reset()
    } else {
      if (formMessage) {
        formMessage.textContent = data.error || 'Errore. Riprova.'
        formMessage.style.color = '#ff6b6b'
      }
    }
  } catch (err) {
    if (formMessage) {
      formMessage.textContent = 'Errore di connessione. Riprova.'
      formMessage.style.color = '#ff6b6b'
    }
  }
})

// ===============================
// BACK TO TOP BUTTON
// ===============================
const backToTop = document.querySelector('[data-back-to-top]')

const toggleBackToTop = () => {
  if (window.scrollY > 600) {
    backToTop?.classList.add('visible')
  } else {
    backToTop?.classList.remove('visible')
  }
}
window.addEventListener('scroll', toggleBackToTop, { passive: true })

backToTop?.addEventListener('click', () => {
  lenis.scrollTo(0)
})

// ===============================
// FOOTER YEAR
// ===============================
const yearEl = document.querySelector('#year')
if (yearEl) yearEl.textContent = new Date().getFullYear()

// ===============================
// LOG STARTUP
// ===============================
console.log(
  '%cTakeOff Milan%c — Performance-driven digital studio',
  'font-weight:900;background:linear-gradient(120deg,#ff66c4,#ffde59);-webkit-background-clip:text;color:transparent;font-size:16px;',
  'color:#666;font-size:12px;'
)
