'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
    end: number
    duration?: number
    suffix?: string
    prefix?: string
}

function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: AnimatedCounterProps) {
    const [count, setCount] = useState(0)
    const [started, setStarted] = useState(false)
    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started) {
                    setStarted(true)
                }
            },
            { threshold: 0.3 }
        )

        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [started])

    useEffect(() => {
        if (!started) return

        const startTime = performance.now()
        const step = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Ease-out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))

            if (progress < 1) {
                requestAnimationFrame(step)
            } else {
                setCount(end)
            }
        }

        requestAnimationFrame(step)
    }, [started, end, duration])

    const formatted = count.toLocaleString('es-CO')

    return (
        <span ref={ref}>
            {prefix}{formatted}{suffix}
        </span>
    )
}

export function AnimatedStats() {
    return (
        <section className="border-b border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="font-display font-bold text-3xl sm:text-4xl text-navy-900 mb-1">
                            <AnimatedCounter end={80000} suffix="+" duration={2500} />
                        </div>
                        <div className="text-sm text-slate-500">Documentos</div>
                    </div>
                    <div>
                        <div className="font-display font-bold text-3xl sm:text-4xl text-navy-900 mb-1">
                            <AnimatedCounter end={100} suffix="%" duration={2000} />
                        </div>
                        <div className="text-sm text-slate-500">Gratuito</div>
                    </div>
                    <div>
                        <div className="font-display font-bold text-3xl sm:text-4xl text-navy-900 mb-1">
                            24/7
                        </div>
                        <div className="text-sm text-slate-500">Disponible</div>
                    </div>
                    <div>
                        <div className="font-display font-bold text-3xl sm:text-4xl text-navy-900 mb-1">
                            Oficial
                        </div>
                        <div className="text-sm text-slate-500">Fuentes</div>
                    </div>
                </div>
            </div>
        </section>
    )
}
