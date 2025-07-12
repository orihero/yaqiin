import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, easeInOut } from "framer-motion";

const images = [
    "https://img.freepik.com/free-photo/strawberry-berry-levitating-white-background_485709-57.jpg?semt=ais_hybrid&w=740",
    "https://img.freepik.com/premium-photo/oranges-fruit-isolated-white_252965-255.jpghttps://img.freepik.com/premium-photo/orange-with-sliced-green-leaves-isolated-white-background_167862-11859.jpg",
    "https://cdn.shopify.com/s/files/1/1575/0603/files/f055d61fb86873568f02b7ae504f5e58b6e47102_VGTC577.jpg?v=1751374344",
];

const LANGS = [
    { code: "uz", label: "Oʻzbekcha" },
    { code: "ru", label: "Русский" },
    { code: "en", label: "English" },
];

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        position: "absolute",
    }),
    center: {
        x: 0,
        opacity: 1,
        position: "relative",
        transition: { duration: 0.5, ease: easeInOut },
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        position: "absolute",
        transition: { duration: 0.5, ease: easeInOut },
    }),
};

const imageVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 80 : -80,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.7, ease: easeInOut },
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 80 : -80,
        opacity: 0,
        transition: { duration: 0.7, ease: easeInOut },
    }),
};

const steps = [
    {
        image: images[0],
        titleKey: "onboarding.step1.title",
        descKey: "onboarding.step1.description",
    },
    {
        image: images[1],
        titleKey: "onboarding.step2.title",
        descKey: "onboarding.step2.description",
    },
    {
        image: images[2],
        titleKey: "onboarding.step3.title",
        descKey: "onboarding.step3.description",
    },
];

const OnboardingScreen: React.FC = () => {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(0); // 1 for next, -1 for back
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [lang, setLang] = useState(i18n.language || "uz");
    const prevStep = useRef(step);
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isScrolling = useRef(false);

    useEffect(() => {
        if (localStorage.getItem("onboardingCompleted")) {
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        i18n.changeLanguage(lang);
        localStorage.setItem("lang", lang);
    }, [lang, i18n]);

    useEffect(() => {
        const handleResize = () => setViewportHeight(window.innerHeight);
        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleResize);
        };
    }, []);

    // Scroll to step when step changes (from button navigation)
    useEffect(() => {
        if (scrollRef.current && !isScrolling.current) {
            const container = scrollRef.current;
            const slideWidth = container.offsetWidth;
            container.scrollTo({ left: step * slideWidth, behavior: "smooth" });
        }
        isScrolling.current = false;
    }, [step]);

    // Update step state on manual scroll
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const slideWidth = container.offsetWidth;
        const newStep = Math.round(container.scrollLeft / slideWidth);
        if (newStep !== step) {
            isScrolling.current = true;
            setStep(newStep);
        }
    };

    const handleNext = () => {
        setDirection(1);
        if (step < steps.length - 1) setStep(step + 1);
    };
    const handleBack = () => {
        setDirection(-1);
        if (step > 0) setStep(step - 1);
    };
    const handleSkipOrFinish = () => {
        localStorage.setItem("onboardingCompleted", "true");
        navigate("/home");
    };

    useEffect(() => {
        prevStep.current = step;
    }, [step]);

    return (
        <div
            className="w-full flex flex-col items-center justify-center  px-0 sm:px-2 overflow-hidden overflow-x-hidden"
            style={{ height: viewportHeight }}
        >
            <div className="flex flex-col w-full h-full flex-1 max-w-md mx-auto relative">
                {/* Language Switcher */}
                <div className="w-full flex justify-end p-3 bg-transparent z-10 absolute top-0 right-0">
                    <select
                        className="border rounded px-2 py-1 text-sm m-2 text-[#232c43] outline-none"
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        aria-label={t("onboarding.selectLanguage")}
                    >
                        {LANGS.map((l) => (
                            <option key={l.code} value={l.code}>
                                {l.label}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Main Card Area - fills screen, disables scroll */}
                <div className="flex flex-col flex-1 h-full">
                    {/* Horizontally scrollable steps */}
                    <div
                        ref={scrollRef}
                        className="w-full flex-1 flex overflow-x-auto scroll-smooth snap-x snap-mandatory bg-white relative scrollbar-hide"
                        style={{
                            borderBottomLeftRadius: 40,
                            borderBottomRightRadius: 40,
                            minHeight: 500,
                            maxHeight: 500,
                        }}
                        onScroll={handleScroll}
                    >
                        {steps.map((s, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center justify-center w-full flex-shrink-0 snap-center"
                                style={{ minWidth: "100%", minHeight: 224 }}
                            >
                                <img
                                    src={s.image}
                                    alt={t(s.titleKey)}
                                    className="w-full h-full object-cover "
                                    // style={{ marginTop: 16 }}
                                />
                            </div>
                        ))}
                    </div>
                    {/* Dark Section with Slide Animation, stuck to bottom */}
                    <div
                        className="w-full bg-[#232c43] rounded-t-3xl pt-8 pb-8 px-6 flex flex-col items-center z-0"
                        style={{
                            minHeight: 260,
                            overflow: "hidden",
                            position: "relative",
                            flexShrink: 0,
                        }}
                    >
                        {/* Dots */}
                        <div className="flex gap-1 mb-6">
                            {steps.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={
                                        idx === step
                                            ? "w-8 h-2 rounded-full bg-white transition-all"
                                            : "w-2 h-2 rounded-full bg-white/60 transition-all"
                                    }
                                />
                            ))}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3 text-center">
                            {t(steps[step].titleKey)}
                        </h2>
                        <p className="text-gray-300 text-center mb-8 text-base">
                            {t(steps[step].descKey)}
                        </p>
                        <div className="flex w-full gap-2 mt-auto">
                            {/* {step > 0 && (
                                <button
                                    className="flex-1 bg-white/20 text-white font-semibold py-3 rounded-xl text-base hover:bg-white/30 transition"
                                    onClick={handleBack}
                                >
                                    {t("onboarding.back")}
                                </button>
                            )} */}
                            {step < steps.length - 1 ? (
                                <>
                                    <button
                                        className="flex-1 bg-white text-[#232c43] font-semibold py-3 rounded-full text-base shadow hover:bg-gray-100 transition"
                                        onClick={handleNext}
                                    >
                                        {t("onboarding.next")}
                                    </button>
                                    {/* <button
                    className="flex-1 bg-white/20 text-white font-semibold py-3 rounded-xl text-base hover:bg-white/30 transition"
                    onClick={handleSkipOrFinish}
                  >
                    {t('onboarding.skip')}
                  </button> */}
                                </>
                            ) : (
                                <button
                                    className="w-full bg-white text-[#232c43] font-semibold py-3 rounded-full text-base shadow hover:bg-gray-100 transition"
                                    onClick={handleSkipOrFinish}
                                >
                                    {t("onboarding.getStarted")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingScreen;
