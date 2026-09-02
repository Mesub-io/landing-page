'use client'

import { useEffect, useState } from 'react'

import { brand, contact, cta, links } from '@/lib/nav'

import { MailIcon, XIcon } from './icons'
import { Logo } from './logo'

function Burger({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      {open ? (
        <path d="m4 4 10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M2.5 5.5h13M2.5 12.5h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  )
}

function Arrow() {
  return (
    <svg className="cta-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!sheetOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheetOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [sheetOpen])

  return (
    <header className="nav" data-scrolled={scrolled}>
      <div className="nav-inner">
        <div className="nav-left">
          <a className="brand" href="/" aria-label={`${brand.name} home`}>
            <span className="brand-tile">
              <Logo />
            </span>
            {brand.name}
          </a>

          <span className="nav-social">
            <a aria-label={contact.x.label} className="icon-button" href={contact.x.href} rel="noreferrer" target="_blank">
              <XIcon />
            </a>
            <a aria-label={contact.email.label} className="icon-button" href={contact.email.href}>
              <MailIcon />
            </a>
          </span>
        </div>

        <nav className="nav-links" aria-label="Main">
          {links.map((link) => (
            <a className="nav-link" href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
        </nav>

        <a className="cta" href={cta.href}>
          {cta.label}
          <Arrow />
        </a>

        <button
          aria-controls="nav-sheet"
          aria-expanded={sheetOpen}
          aria-label={sheetOpen ? 'Close menu' : 'Open menu'}
          className="nav-toggle"
          onClick={() => setSheetOpen((open) => !open)}
          type="button"
        >
          <Burger open={sheetOpen} />
        </button>
      </div>

      {sheetOpen ? (
        <div className="nav-sheet" id="nav-sheet">
          <div className="nav-sheet-inner">
            {links.map((link) => (
              <a className="nav-sheet-link" href={link.href} key={link.label} onClick={() => setSheetOpen(false)}>
                {link.label}
              </a>
            ))}
            <a className="cta nav-sheet-cta" href={cta.href} onClick={() => setSheetOpen(false)}>
              {cta.label}
              <Arrow />
            </a>
          </div>
        </div>
      ) : null}
    </header>
  )
}
