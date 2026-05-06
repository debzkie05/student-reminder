import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  CheckSquare,
  Calendar,
  FolderOpen,
  BarChart3,
  AlertTriangle,
  Target,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: CheckSquare,
    title: "Smart Task Management",
    description:
      "Create, edit, and organize your assignments with ease. Mark tasks as pending, in-progress, or completed.",
    color: "#6366F1",
  },
  {
    icon: Calendar,
    title: "Calendar View",
    description:
      "Visualize your deadlines on an interactive calendar. Never miss a due date again.",
    color: "#10B981",
  },
  {
    icon: FolderOpen,
    title: "Subject Categories",
    description:
      "Organize tasks by subject — Math, Science, English, and more. Keep everything sorted.",
    color: "#F59E0B",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "See your completion rates at a glance with visual progress rings and detailed statistics.",
    color: "#8B5CF6",
  },
  {
    icon: AlertTriangle,
    title: "Overdue Alerts",
    description:
      "Get instant visual alerts for overdue tasks so you can prioritize what needs attention first.",
    color: "#EF4444",
  },
  {
    icon: Target,
    title: "Priority Levels",
    description:
      "Assign high, medium, or low priority to tasks and focus on what matters most.",
    color: "#EC4899",
  },
];

function useIntersectionObserver(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    const current = ref.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [threshold]);

  return { ref, isVisible };
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const featuresSection = useIntersectionObserver(0.1);
  const ctaSection = useIntersectionObserver(0.2);

  // If already authenticated, go to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing-page">
      {/* ===== HERO SECTION ===== */}
      <section className="landing-hero">
        {/* Animated background elements */}
        <div className="landing-hero-bg">
          <div className="landing-orb landing-orb-1" />
          <div className="landing-orb landing-orb-2" />
          <div className="landing-orb landing-orb-3" />
          <div className="landing-grid-overlay" />
        </div>

        <div className="landing-hero-content">
          {/* Logo + Badge */}
          <div className="landing-badge animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Student Task Manager</span>
          </div>

          {/* App Icon */}
          <div className="landing-logo-wrapper animate-fade-in">
            <div className="landing-logo">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="landing-title animate-fade-in">
            Stay On Top of Your
            <span className="landing-title-accent"> Studies</span>
          </h1>

          {/* Subtitle */}
          <p className="landing-subtitle animate-fade-in">
            TaskFlow helps you organize assignments, track deadlines, and manage your
            academic workload — all in one beautiful, easy-to-use app.
          </p>

          {/* CTA Buttons */}
          <div className="landing-cta-group animate-fade-in">
            <Button
              size="lg"
              className="landing-btn-primary"
              onClick={() => navigate("/auth")}
              id="landing-get-started"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="landing-btn-secondary"
              onClick={() => navigate("/auth?mode=signin")}
              id="landing-sign-in"
            >
              Sign In
            </Button>
          </div>

          {/* Scroll indicator */}
          <button
            onClick={scrollToFeatures}
            className="landing-scroll-indicator animate-fade-in"
            aria-label="Scroll to features"
          >
            <span className="text-sm font-medium opacity-70">Discover features</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="landing-features-section" ref={featuresSection.ref}>
        <div className="landing-section-container">
          <div
            className={`landing-section-header ${featuresSection.isVisible ? "landing-visible" : "landing-hidden"
              }`}
          >
            <h2 className="landing-section-title">
              Everything You Need to{" "}
              <span className="landing-title-accent">Succeed</span>
            </h2>
            <p className="landing-section-subtitle">
              Designed specifically for students, TaskFlow gives you the tools to stay
              organized and on track.
            </p>
          </div>

          <div className="landing-features-grid">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`landing-feature-card ${featuresSection.isVisible ? "landing-visible" : "landing-hidden"
                  }`}
                style={{
                  transitionDelay: featuresSection.isVisible
                    ? `${index * 100}ms`
                    : "0ms",
                }}
              >
                <div
                  className="landing-feature-icon"
                  style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="landing-feature-title">{feature.title}</h3>
                <p className="landing-feature-desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="landing-cta-section" ref={ctaSection.ref}>
        <div
          className={`landing-cta-container ${ctaSection.isVisible ? "landing-visible" : "landing-hidden"
            }`}
        >
          <div className="landing-cta-bg">
            <div className="landing-orb landing-orb-4" />
            <div className="landing-orb landing-orb-5" />
          </div>
          <div className="landing-cta-content">
            <h2 className="landing-cta-title">Ready to Get Organized?</h2>
            <p className="landing-cta-subtitle">
              Join thousands of students using TaskFlow to ace their academics.
              It's free and takes less than a minute to sign up.
            </p>
            <div className="landing-cta-group">
              <Button
                size="lg"
                className="landing-btn-primary-light"
                onClick={() => navigate("/auth")}
                id="landing-cta-signup"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="landing-footer-logo">
            <GraduationCap className="w-5 h-5" />
            <span>TaskFlow</span>
          </div>
          <p className="landing-footer-text">
            © {new Date().getFullYear()} . BUILT FOR STUDENTS
          </p>
        </div>
      </footer>
    </div>
  );
}
