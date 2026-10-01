import { useEffect, useRef } from "react"



export default function CircularWaveLoader() {

    const waveRef = useRef<SVGPathElement | null>(null)

    useEffect(() => {

        const waveElement = waveRef.current

        if (!waveElement) {
            return
        }

        const cx = 150
        const cy = 150


        const radius = 100


        const points = 180


        let time = 0


        let lastTime = performance.now()


        let animationId: number


        function buildVenomWave(t: number) {

            let path = ""

            const waveCount = 7

            /*
            * سرعت کامل شدن
            */
            const speed = 0.8

            /*
            * مقدار progress
            *
            * 0   = تقریباً چیزی دیده نمی‌شود
            * 1   = کل حلقه دیده می‌شود
            */
            const progress =
                (Math.sin(t * speed) + 1) / 2


            /*
            * نقطه شروع روی دایره
            */
            const startAngle =
                t * 1.5


            /*
            * مقدار زاویه‌ای که باید رسم شود
            *
            * progress = 0  → 0 درجه
            * progress = 1  → 360 درجه
            */
            const visibleAngle =
                progress *
                Math.PI *
                2


            /*
            * تعداد نقاطی که باید رسم شوند
            */
            const visiblePoints =
                Math.max(
                    2,
                    Math.floor(
                        points *
                        progress
                    )
                )


            for (
                let i = 0;
                i <= visiblePoints;
                i++
            ) {

                /*
                * موقعیت فعلی روی قسمت قابل مشاهده
                */
                const localProgress =
                    i / visiblePoints


                /*
                * زاویه فعلی
                */
                const angle =
                    startAngle +
                    localProgress *
                    visibleAngle


                /*
                * موج اصلی
                */
                const mainWave =
                    Math.sin(
                        angle * waveCount +
                        t * 2.5
                    )


                /*
                * موج دوم
                */
                const secondaryWave =
                    Math.sin(
                        angle * 13 -
                        t * 1.5
                    )


                /*
                * جزئیات کوچک
                */
                const detailWave =
                    Math.sin(
                        angle * 23 +
                        t * 2.7
                    )


                /*
                * حرکت ارگانیک
                */
                const organicWave =
                    Math.sin(
                        angle * 3 -
                        t * 0.8
                    )


                /*
                * نفس کشیدن
                */
                const breathing =
                    1 +
                    Math.sin(t * 1.2) *
                    0.18


                /*
                * ترکیب موج‌ها
                */
                const wave =
                    (
                        mainWave * 11 +
                        secondaryWave * 5 +
                        detailWave * 2.5 +
                        organicWave * 4
                    ) *
                    breathing


                /*
                * برآمدگی‌های زنده
                */
                const pulse =
                    Math.pow(
                        (
                            Math.sin(
                                angle * 2.5 -
                                t * 1.8
                            ) + 1
                        ) / 2,
                        3
                    )


                const tendril =
                    pulse * 8


                /*
                * شعاع نهایی
                */
                const currentRadius =
                    radius +
                    wave +
                    tendril


                /*
                * تبدیل polar → Cartesian
                */
                const x =
                    cx +
                    currentRadius *
                    Math.cos(angle)


                const y =
                    cy +
                    currentRadius *
                    Math.sin(angle)


                /*
                * ساخت path
                */
                if (i === 0) {

                    path += `M ${x} ${y}`

                } else {

                    path += ` L ${x} ${y}`

                }

            }


            return path
        }
        function animate(now: number) {

            const deltaTime =
                Math.min(
                    50,
                    now - lastTime
                )


            lastTime = now

            time += deltaTime / 1000

            const newPath =
                buildVenomWave(time)

            waveElement?.setAttribute(
                "d",
                newPath
            )

            animationId =
                requestAnimationFrame(animate)
        }

        animationId =
            requestAnimationFrame(animate)


        return () => {

            cancelAnimationFrame(animationId)

        }

    }, [])

    return (

        <div className="total_loading">
            <div className="circularWaveLoader">
                <svg
                    viewBox="0 0 300 300"
                    aria-label="Loading"
                >
                    <circle
                        className="ring"
                        cx="150"
                        cy="150"
                        r="100"
                    />
                    <path
                        ref={waveRef}
                        className="wave"
                    />
                </svg>
            </div>
        </div>

    )
}





