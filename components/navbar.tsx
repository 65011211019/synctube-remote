'use client'

import Link from "next/link"
import { useState } from "react"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [secretCode, setSecretCode] = useState("")
  const [codeOk, setCodeOk] = useState(false)
  const [codeError, setCodeError] = useState("")

  // ฟังก์ชันเปิด modal ถ้ายังไม่ได้กรอก code
  const handleRoomsClick = (e?: React.MouseEvent) => {
    if (!codeOk) {
      e?.preventDefault()
      setShowCodeModal(true)
      setSecretCode("")
      setCodeError("")
    } else {
      setMenuOpen(false)
    }
  }

  const handleCodeSubmit = () => {
    if (secretCode.trim().toLowerCase() === "av") {
      setCodeOk(true)
      setShowCodeModal(false)
      setMenuOpen(false)
    } else {
      setCodeError("Code ไม่ถูกต้อง")
    }
  }

  return (
    <>
      <nav className="w-full bg-black text-white px-6 py-3 flex items-center justify-between shadow-lg relative z-20">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight hover:opacity-80 transition">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="10" rx="2" /><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" /></svg>
          SyncTube <span className="text-gray-300">Remote</span>
        </Link>
        {/* Desktop menu */}
        <div className="hidden md:flex gap-6 items-center">
          {codeOk && (
            <Link href="/rooms" className="rounded px-3 py-1.5 font-medium hover:bg-gray-800 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-600">ห้องออนไลน์</Link>
          )}
          {!codeOk && (
            <button className="rounded px-3 py-1.5 font-medium hover:bg-gray-800 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-600" onClick={handleRoomsClick}>ห้องออนไลน์</button>
          )}
        </div>
        {/* Hamburger button for mobile */}
        <button
          className="md:hidden flex items-center px-2 py-1 border border-gray-700 rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 transition"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'} absolute top-full left-0 w-full bg-black flex flex-col gap-2 py-3 px-6 shadow-lg z-50`}>
          {codeOk && (
            <Link href="/rooms" className="rounded px-3 py-2 font-medium hover:bg-gray-800 hover:text-white transition-colors duration-150" onClick={() => setMenuOpen(false)}>
              ห้องออนไลน์
            </Link>
          )}
          {!codeOk && (
            <button className="rounded px-3 py-2 font-medium hover:bg-gray-800 hover:text-white transition-colors duration-150" onClick={handleRoomsClick}>
              ห้องออนไลน์
            </button>
          )}
        </div>
      </nav>
      {/* Modal สำหรับกรอก Code ลับ */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col gap-3">
            <div className="font-bold text-lg text-center text-black">กรอก Code ลับ</div>
            <input
              type="text"
              className="border rounded px-3 py-2 text-black"
              placeholder="Code"
              value={secretCode}
              onChange={e => setSecretCode(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleCodeSubmit() }}
              autoFocus
            />
            {codeError && <div className="text-red-500 text-sm text-center">{codeError}</div>}
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1 rounded bg-gray-200 text-black hover:bg-gray-300" onClick={() => setShowCodeModal(false)}>ยกเลิก</button>
              <button className="px-3 py-1 rounded bg-black text-white hover:bg-gray-800" onClick={handleCodeSubmit}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 