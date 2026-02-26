'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProgress } from '@/hooks/useProgress'
import { useAcronyms } from '@/hooks/useAcronyms'
import { signInWithGoogle, signOutUser } from '@/lib/auth'
import { getUserProfile } from '@/lib/firestore'
import { MasteryRing } from '@/components/home/MasteryRing'
import { DomainBreakdown } from '@/components/home/DomainBreakdown'
import { ExamCountdown } from '@/components/home/ExamCountdown'
import { AwarenessStats } from '@/components/home/AwarenessStats'
import { QuickLaunch } from '@/components/home/QuickLaunch'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { UserProfile } from '@/types'
import { Smartphone, X } from 'lucide-react'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const { progressMap, loading: progressLoading } = useProgress(user?.uid ?? null)
  const { allAcronyms } = useAcronyms()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  const loadProfile = useCallback(async () => {
    if (!user) return
    const p = await getUserProfile(user.uid)
    setProfile(p)
  }, [user])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    const dismissed = localStorage.getItem('install-banner-dismissed')
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (!dismissed && !isStandalone) {
      setTimeout(() => setShowInstallBanner(true), 2000)
    }
  }, [])

  const dismissBanner = () => {
    setShowInstallBanner(false)
    localStorage.setItem('install-banner-dismissed', '1')
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141413]">
        <div className="w-10 h-10 border-2 border-[#d97757] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#141413] px-6 gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#d97757] font-sans mb-2">AcronymDrill</h1>
          <p className="text-[#b0aea5]">Know every acronym. Pass the exam.</p>
        </div>
        <div className="text-center space-y-4">
          <p className="text-[#faf9f5] text-sm">
            Study all {allAcronyms.length} CompTIA Security+ SY0-701 acronyms with spaced repetition.
          </p>
        </div>
        <button
          onClick={() => signInWithGoogle()}
          className="w-full max-w-xs py-4 bg-[#d97757] hover:bg-[#c86846] text-white rounded-xl font-semibold font-sans flex items-center justify-center gap-3 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  const total = allAcronyms.length
  const masteredCount = Array.from(progressMap.values()).filter(
    (p) => p.masteryLevel === 'mastered' || p.masteryLevel === 'confident'
  ).length
  const masteryPercent = total > 0 ? (masteredCount / total) * 100 : 0

  const domainStats = [1, 2, 3, 4, 5].map((d) => {
    const domainAcr = allAcronyms.filter((a) => a.domain === d)
    const mastered = domainAcr.filter((a) => {
      const p = progressMap.get(a.id)
      return p && (p.masteryLevel === 'mastered' || p.masteryLevel === 'confident')
    }).length
    return {
      domain: d,
      label: `D${d}`,
      percent: domainAcr.length > 0 ? (mastered / domainAcr.length) * 100 : 0,
      mastered,
      total: domainAcr.length,
    }
  })

  return (
    <div className="min-h-screen bg-[#141413] flex flex-col max-w-lg mx-auto">
      {showInstallBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#d97757] text-white px-4 py-3 flex items-center justify-between text-sm max-w-lg mx-auto">
          <span className="flex items-center gap-2"><Smartphone className="w-4 h-4 flex-shrink-0" /> Tap Share → Add to Home Screen for the best experience</span>
          <button onClick={dismissBanner} className="ml-3"><X className="w-4 h-4" /></button>
        </div>
      )}

      <header className="flex items-center justify-between px-4 py-4 border-b border-[#e8e6dc20]">
        <h1 className="text-xl font-bold text-[#d97757] font-sans">AcronymDrill</h1>
        <button
          onClick={() => setShowUserMenu(true)}
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#e8e6dc20]"
        >
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-[#d97757] flex items-center justify-center text-white font-bold text-sm">
              {user.displayName?.[0] ?? 'U'}
            </div>
          )}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-8">
        <ExamCountdown
          examDate={profile?.examDate}
          userId={user.uid}
          onUpdate={loadProfile}
        />

        <MasteryRing
          percent={masteryPercent}
          total={total}
          mastered={masteredCount}
        />

        <DomainBreakdown stats={domainStats} />

        <div className="my-4">
          <QuickLaunch />
        </div>

        <AwarenessStats
          progressMap={progressMap}
          totalAcronyms={total}
          totalStudyMinutes={profile?.totalStudyMinutes ?? 0}
          weeklyActivity={profile?.weeklyActivity ?? {
            mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false,
          }}
        />
      </main>

      <BottomSheet isOpen={showUserMenu} onClose={() => setShowUserMenu(false)}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {user.photoURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="avatar" className="w-12 h-12 rounded-full" referrerPolicy="no-referrer" />
            )}
            <div>
              <p className="font-semibold text-[#faf9f5]">{user.displayName}</p>
              <p className="text-sm text-[#b0aea5]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOutUser()
              setShowUserMenu(false)
            }}
            className="w-full py-3 bg-[#c0392b]/20 border border-[#c0392b]/40 text-[#c0392b] rounded-xl font-semibold"
          >
            Sign Out
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
