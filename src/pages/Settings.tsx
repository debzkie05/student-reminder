import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  User,
  Bell,
  Moon,
  Sun,
  Palette,
  Shield,
  HelpCircle,
  Info,
  ChevronRight,
  Mail,
  Clock,
  CalendarDays,
  AlertTriangle,
  BarChart3,
  LogOut,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationPreferences } from "@/contexts/NotificationContext";
import type { EmailFrequency } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { toast } from "sonner";

type Theme = "light" | "dark" | "system";

const timeOptions = [
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
];

export default function Settings() {
  const { user, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { preferences, updatePreference } = useNotificationPreferences();
  const { theme, setTheme } = useTheme();
  const [dashboardNotifications, setDashboardNotifications] = useState({
    taskReminders: true,
    dueDateAlerts: true,
  });

  // Dialogs
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || "");
  const [editSaving, setEditSaving] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const userName = user?.fullName || "Student";
  const userEmail = user?.email || "student@school.edu";

  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !auth.currentUser) return;
    setEditSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: editName.trim() });
      await refreshUser();
      toast.success("Profile updated successfully!");
      setEditProfileOpen(false);
    } catch {
      toast.error("Failed to update profile.");
    }
    setEditSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/welcome", { replace: true });
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fade-in">
      <PageHeader title="Settings" description="Manage your preferences" />

      {/* Profile Section */}
      <Card className="p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="w-16 h-16 shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground truncate">{userName}</h3>
              <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto shrink-0" onClick={() => { setEditName(userName); setEditProfileOpen(true); }}>
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Appearance</h3>
            <p className="text-sm text-muted-foreground">Customize how TaskFlow looks</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground">Select your preferred theme</p>
            </div>
            <Select value={theme} onValueChange={(v) => handleThemeChange(v as Theme)}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light"><div className="flex items-center gap-2"><Sun className="w-4 h-4" />Light</div></SelectItem>
                <SelectItem value="dark"><div className="flex items-center gap-2"><Moon className="w-4 h-4" />Dark</div></SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Dashboard Notifications */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10"><Bell className="w-5 h-5 text-primary" /></div>
          <div>
            <h3 className="font-semibold text-foreground">Dashboard Notifications</h3>
            <p className="text-sm text-muted-foreground">In-app alerts and reminders</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-foreground">Task Reminders</p><p className="text-sm text-muted-foreground">Show toast notifications on login</p></div>
            <Switch checked={dashboardNotifications.taskReminders} onCheckedChange={(checked) => setDashboardNotifications({ ...dashboardNotifications, taskReminders: checked })} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-foreground">Due Date Banners</p><p className="text-sm text-muted-foreground">Show overdue, today, and upcoming banners</p></div>
            <Switch checked={dashboardNotifications.dueDateAlerts} onCheckedChange={(checked) => setDashboardNotifications({ ...dashboardNotifications, dueDateAlerts: checked })} />
          </div>
        </div>
      </Card>

      {/* Email Notifications */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10"><Mail className="w-5 h-5 text-primary" /></div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">Receive task summaries via email</p>
          </div>
          <Switch checked={preferences.emailEnabled} onCheckedChange={(checked) => updatePreference("emailEnabled", checked)} id="email-notifications-toggle" />
        </div>

        <div className="settings-email-notice mb-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Cloud Functions Required</p>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">Email delivery requires Firebase Cloud Functions. Your preferences are saved and will apply once configured.</p>
            </div>
          </div>
        </div>

        <div className={cn("space-y-5 transition-opacity duration-300", !preferences.emailEnabled && "opacity-50 pointer-events-none")}>
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-foreground">Email Frequency</p><p className="text-sm text-muted-foreground">How often to send email digests</p></div>
            <Select value={preferences.frequency} onValueChange={(v) => updatePreference("frequency", v as EmailFrequency)}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily"><div className="flex items-center gap-2"><Clock className="w-4 h-4" />Daily Digest</div></SelectItem>
                <SelectItem value="weekly"><div className="flex items-center gap-2"><CalendarDays className="w-4 h-4" />Weekly Summary</div></SelectItem>
                <SelectItem value="both"><div className="flex items-center gap-2"><Bell className="w-4 h-4" />Both</div></SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-foreground">Preferred Time</p><p className="text-sm text-muted-foreground">When to send daily digest</p></div>
            <Select value={preferences.preferredTime} onValueChange={(v) => updatePreference("preferredTime", v)}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>{timeOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <Separator />
          <div>
            <p className="font-medium text-foreground mb-3">Email Content</p>
            <div className="space-y-3">
              {[
                { key: "includeOverdue" as const, label: "Overdue Tasks", desc: "Tasks past their deadline", icon: AlertTriangle, color: "red" },
                { key: "includeDueToday" as const, label: "Tasks Due Today", desc: "Tasks with today's deadline", icon: Clock, color: "amber" },
                { key: "includeDueThisWeek" as const, label: "Tasks Due This Week", desc: "Upcoming tasks within 7 days", icon: CalendarDays, color: "blue" },
                { key: "includeProgressSummary" as const, label: "Progress Summary", desc: "Completion rate and stats", icon: BarChart3, color: "green" },
              ].map((item) => (
                <div key={item.key} className="settings-email-content-item">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md bg-${item.color}-100 dark:bg-${item.color}-900/30`}>
                      <item.icon className={`w-4 h-4 text-${item.color}-600 dark:text-${item.color}-400`} />
                    </div>
                    <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  </div>
                  <Switch checked={preferences[item.key]} onCheckedChange={(checked) => updatePreference(item.key, checked)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Help & Support */}
      <Card className="mb-6">
        <button onClick={() => setHelpOpen(true)} className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors rounded-t-lg">
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-muted"><HelpCircle className="w-5 h-5 text-muted-foreground" /></div><span className="font-medium text-foreground">Help & Support</span></div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <Separator />
        <button onClick={() => setPrivacyOpen(true)} className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-muted"><Shield className="w-5 h-5 text-muted-foreground" /></div><span className="font-medium text-foreground">Privacy Policy</span></div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <Separator />
        <button onClick={() => setAboutOpen(true)} className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors rounded-b-lg">
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-muted"><Info className="w-5 h-5 text-muted-foreground" /></div><span className="font-medium text-foreground">About TaskFlow</span></div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </Card>

      {/* Sign Out (visible on all devices, especially useful on mobile) */}
      <Card className="mb-6">
        <button onClick={handleSignOut} className="w-full p-4 flex items-center gap-3 hover:bg-destructive/10 transition-colors rounded-lg text-destructive">
          <div className="p-2 rounded-lg bg-destructive/10"><LogOut className="w-5 h-5" /></div>
          <span className="font-medium">Sign Out</span>
        </button>
      </Card>

      {/* Version Info */}
      <div className="text-center text-sm text-muted-foreground pb-4">
        <p>TaskFlow v1.0.0</p>
        <p className="mt-1">Student Task Management System</p>
      </div>

      {/* ===== DIALOGS ===== */}

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Display Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={userEmail} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={editSaving || !editName.trim()}>
              {editSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" />Save</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>Help & Support</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Getting Started</h4>
              <p>Create tasks from the Dashboard or Tasks page. Set due dates, priorities, and categories to stay organized.</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Categories</h4>
              <p>Use the Categories page to manage subjects. You can also create new categories inline when adding a task.</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Notifications</h4>
              <p>Dashboard banners show overdue and upcoming tasks. Email notifications can be configured in Settings.</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Need more help?</h4>
              <p>Contact support at <span className="text-primary font-medium">support@taskflow.app</span></p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>Privacy Policy</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2 text-sm text-muted-foreground max-h-[400px] overflow-y-auto">
            <p><strong className="text-foreground">Data Collection:</strong> TaskFlow stores your tasks, categories, and preferences in Firebase Firestore, linked to your authenticated account.</p>
            <p><strong className="text-foreground">Authentication:</strong> We use Firebase Authentication. Passwords are never stored in plain text.</p>
            <p><strong className="text-foreground">Data Usage:</strong> Your data is used solely to provide the task management service. We do not sell or share your data with third parties.</p>
            <p><strong className="text-foreground">Data Retention:</strong> Your data is retained as long as your account is active. You may request deletion at any time.</p>
            <p><strong className="text-foreground">Security:</strong> All data is transmitted over HTTPS and stored in Google's secure cloud infrastructure.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>About TaskFlow</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg">
              <span className="text-2xl text-primary-foreground font-bold">T</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">TaskFlow</h3>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>
            <p className="text-sm text-muted-foreground">A student task management system built with React, Firebase, and modern web technologies.</p>
            <Separator />
            <p className="text-xs text-muted-foreground">&copy; 2026 TaskFlow. All rights reserved.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
