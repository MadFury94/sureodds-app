"use client";
import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Scroll-reveal: watch all .reveal elements
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        observer.unobserve(entry.target); // animate once
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -4% 0px" }
        );

        const els = document.querySelectorAll(".reveal, .reveal-stagger");
        els.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return <div className="page-enter">{children}</div>;
}
