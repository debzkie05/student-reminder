import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  RefreshCw,
  LogOut,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, signOut, resendVerification, refreshUser } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setResendSuccess(false);
    const result = await resendVerification();
    if (result.success) {
      setResendSuccess(true);
    } else {
      setError(result.error || "Failed to resend.");
    }
    setResendLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshLoading(true);
    setError("");
    await refreshUser();
    // After refresh, if verified, the ProtectedRoute will let them through
    // We need to check and navigate
    setTimeout(() => {
      setRefreshLoading(false);
      // The component will re-render with updated user
      // If still not verified, show a message
      if (user && !user.emailVerified) {
        setError("Email not yet verified. Please check your inbox and click the verification link.");
      }
    }, 1000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/welcome", { replace: true });
  };

  // If user became verified, redirect
  if (user?.emailVerified) {
    return (
      <div className="auth-page">
        <div className="auth-bg">
          <div className="landing-orb landing-orb-1" />
          <div className="landing-orb landing-orb-2" />
          <div className="landing-grid-overlay" />
        </div>
        <div className="auth-container animate-fade-in">
          <div className="auth-card" style={{ textAlign: "center" }}>
            <div style={{ 
              width: 72, height: 72, borderRadius: "50%", 
              background: "linear-gradient(135deg, #10B981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem"
            }}>
              <CheckCircle2 className="w-9 h-9 text-white" />
            </div>
            <h1 className="auth-title">Email Verified!</h1>
            <p className="auth-subtitle" style={{ marginBottom: "1.5rem" }}>
              Your email has been successfully verified. You can now access your dashboard.
            </p>
            <Button
              size="lg"
              className="auth-submit-btn"
              onClick={() => navigate("/", { replace: true })}
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-grid-overlay" />
      </div>

      <div className="auth-container animate-fade-in">
        <div className="auth-card" style={{ textAlign: "center" }}>
          {/* Icon */}
          <div style={{ 
            width: 72, height: 72, borderRadius: "50%", 
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem"
          }}>
            <Mail className="w-9 h-9 text-white" />
          </div>

          <h1 className="auth-title">Verify your email</h1>
          <p className="auth-subtitle" style={{ marginBottom: "0.5rem" }}>
            We've sent a verification link to:
          </p>
          <p style={{ 
            fontWeight: 600, color: "#6366F1", fontSize: "1.05rem", 
            marginBottom: "1.5rem", wordBreak: "break-all" 
          }}>
            {user?.email}
          </p>

          <p style={{ 
            color: "#64748B", fontSize: "0.9rem", lineHeight: 1.6,
            marginBottom: "2rem" 
          }}>
            Please open your email and click the verification link to continue. 
            If you don't see it, check your spam folder.
          </p>

          {/* Error / Success Messages */}
          {error && (
            <div className="auth-error animate-scale-in" style={{ marginBottom: "1rem" }}>
              {error}
            </div>
          )}
          {resendSuccess && (
            <div style={{ 
              background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8,
              padding: "0.75rem 1rem", color: "#065F46", fontSize: "0.875rem",
              marginBottom: "1rem"
            }}>
              ✓ Verification email sent! Check your inbox.
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Button
              size="lg"
              className="auth-submit-btn"
              onClick={handleRefresh}
              disabled={refreshLoading}
            >
              {refreshLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  <span>I've verified my email</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleResend}
              disabled={resendLoading}
              style={{ width: "100%", borderRadius: 12, height: 48 }}
            >
              {resendLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span>Resend verification email</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={handleSignOut}
              style={{ width: "100%", borderRadius: 12, height: 48, color: "#94A3B8" }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
