import { useState } from "react"







export function AboutUs() {

    const [persian, setPersian] = useState(false)


    return (
        <div>
            <div className="change-lan" onClick={() => {
                setPersian(!persian)
            }}>
                <span className={`circle ${persian ? "IrCircle": "UsaCircle"}`}></span>
            </div>

            {
                persian && (
                    <section dir="rtl">

                    <h1>من کی هستم؟</h1>

                    <p>
                        من یک برنامه‌نویس خودآموخته‌ام که به ساختن، یادگرفتن و فهمیدن
                        چیزها از ریشه علاقه دارم.
                    </p>

                    <p>
                        برای من برنامه‌نویسی فقط نوشتن چند خط کد نیست؛
                        مهم این است که بفهمم پشت هر خط کد چه اتفاقی می‌افتد،
                        چرا کار می‌کند و اگر کار نکرد، دقیقاً مشکل از کجاست.
                    </p>

                    <p>
                        از ساخت رابط‌های کاربری با <strong>React</strong> و
                        <strong>TypeScript</strong> گرفته تا طراحی API، احراز هویت،
                        دیتابیس و کار با <strong>Node.js</strong> و
                        <strong>PostgreSQL</strong>، همیشه سعی می‌کنم
                        چیزی را واقعاً بفهمم، نه اینکه فقط آن را کپی کنم.
                    </p>

                    <p>
                        من از باگ‌ها فرار نمی‌کنم؛
                        معمولاً همان باگی که چند ساعت ذهنم را درگیر می‌کند،
                        در نهایت تبدیل به یکی از چیزهایی می‌شود که هیچ‌وقت فراموشش نمی‌کنم.
                    </p>

                    <p>
                        مسیر یادگیری من هنوز تمام نشده و احتمالاً هیچ‌وقت هم قرار نیست تمام شود؛
                        چون هر چیزی که می‌سازم، دروازه‌ای است برای فهمیدن چیز بعدی.
                    </p>

                    <blockquote>
                        «من فقط نمی‌خواهم بدانم چه چیزی کار می‌کند؛
                        می‌خواهم بدانم چرا کار می‌کند.»
                    </blockquote>

                </section>

                )
            }
            {
                !persian && (
                    <section>

                    <h1>Who Am I?</h1>

                    <p>
                        I’m a self-taught developer who enjoys building things,
                        learning new technologies, and understanding how things work
                        from the ground up.
                    </p>

                    <p>
                        To me, programming isn’t just about writing code.
                        I want to understand what happens behind every line,
                        why it works, and when it doesn’t, where the problem actually comes from.
                    </p>

                    <p>
                        From building user interfaces with <strong>React</strong> and
                        <strong>TypeScript</strong> to designing APIs, authentication systems,
                        databases, and working with <strong>Node.js</strong> and
                        <strong>PostgreSQL</strong>, I always try to truly understand what I build
                        instead of simply copying code.
                    </p>

                    <p>
                        I don’t run away from bugs.
                        In fact, the bugs that keep me stuck for hours often become
                        the lessons I remember the longest.
                    </p>

                    <p>
                        My learning journey is far from over, and I don’t think it ever will be.
                        Every project I build opens the door to something new,
                        and every problem I solve makes me want to understand more.
                    </p>

                    <blockquote>
                        “I don’t just want to know what works;
                        I want to understand why it works.”
                    </blockquote>
                    ```

                    </section>

                )
            }






        </div>



    )







}







