"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { downloadWeddingReportPdf } from "@/lib/reportPdf";
import { WEDDING_ID } from "@/lib/wedding";

type Attendance =
  | "Accepted"
  | "Declined"
  | "Pending";

type Guest = {
  id: string;
  guestId: string;
  firstName: string;
  lastName: string;
  email: string;
  attendance: Attendance;
  invitedGuests: number;
  paymentReceived: number;
  source: "automatic" | "manual";
  message: string;
  submitted: string;
};

type Contribution = {
  id: string;
  guestId: string | null;
  contributor: string;
  amount: number;
  date: string;
  status: "Received" | "Pending";
};

type DashboardRsvp = {
  id: string;
  guest_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  attendance: string;
  number_of_guests: number;
  message: string | null;
  submitted_at: string;
  source: "automatic" | "manual";
};

type DashboardContribution = {
  id: string;
  guest_id: string | null;
  contributor: string | null;
  amount: number | string;
  created_at: string;
  status: "Received" | "Pending";
};

const ADMIN_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ADMIN_IDLE_WARNING_MS = 2 * 60 * 1000;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [
    checkingAccess,
    setCheckingAccess,
  ] = useState(true);

  const [guests, setGuests] =
    useState<Guest[]>([]);

  const [contributions, setContributions] =
    useState<Contribution[]>([]);

  const [dataError, setDataError] =
    useState("");

  const [loadingDashboard, setLoadingDashboard] =
    useState(true);

  const [sessionExpiryWarning, setSessionExpiryWarning] =
    useState(false);

  const [showManualForm, setShowManualForm] =
    useState(false);

  const [manualError, setManualError] =
    useState("");

  const [manualSaving, setManualSaving] =
    useState(false);

  const [showContributionForm, setShowContributionForm] =
    useState(false);

  const [contributionError, setContributionError] =
    useState("");

  const [contributionSaving, setContributionSaving] =
    useState(false);

  const [deletingGuest, setDeletingGuest] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<"All" | Attendance>("All");

  const [selectedGuest, setSelectedGuest] =
    useState<Guest | null>(null);

  const [activeSection, setActiveSection] =
    useState<
      | "overview"
      | "rsvps"
      | "announcements"
      | "contributions"
    >("overview");

  const [
    showAnnouncementForm,
    setShowAnnouncementForm,
  ] = useState(false);

  const [announcement, setAnnouncement] =
    useState({
      title: "",
      message: "",
    });

  /* =========================================================
     SUPABASE AUTH + DATA LOAD
  ========================================================== */
  useEffect(() => {
    let mounted = true;

    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      const { data: membership, error: membershipError } =
        await supabase
          .from("wedding_members")
          .select("id")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

      if (membershipError || !membership) {
        router.replace("/");
        return;
      }

      // Access is confirmed. Render the admin shell while its data loads.
      if (mounted) {
        setCheckingAccess(false);
      }

      // These independent dashboard requests do not need to wait for each other.
      const [rsvpV2Result, contributionResult] = await Promise.all([
        supabase.rpc("get_admin_dashboard_rsvps_v2"),
        supabase.rpc("get_admin_dashboard_contributions"),
      ]);
      const rsvpResult = rsvpV2Result.error
        ? await supabase.rpc("get_admin_dashboard_rsvps")
        : rsvpV2Result;

      if (!mounted) {
        return;
      }

      if (
        rsvpResult.error ||
        contributionResult.error
      ) {
        console.error(
          "Admin data load failed:",
          rsvpResult.error ||
            contributionResult.error
        );
        setDataError(
          "We could not load the dashboard data. Please refresh and try again."
        );
        setLoadingDashboard(false);
        return;
      }

      const loadedContributions: Contribution[] = (
        (contributionResult.data || []) as DashboardContribution[]
      ).map((contribution) => ({
        id: contribution.id,
        guestId: contribution.guest_id,
        contributor: contribution.contributor || "Anonymous",
        amount: Number(contribution.amount),
        date: formatDate(contribution.created_at),
        status: contribution.status as Contribution["status"],
      }));

      const paymentsByGuest = new Map<string, number>();
      loadedContributions
        .filter(
          (contribution) =>
            contribution.status === "Received" &&
            contribution.guestId
        )
        .forEach((contribution) => {
          paymentsByGuest.set(
            contribution.guestId!,
            (paymentsByGuest.get(contribution.guestId!) || 0) +
              contribution.amount
          );
        });

      setContributions(loadedContributions);
      setGuests(
        ((rsvpResult.data || []) as DashboardRsvp[]).map((rsvp) => {
          return {
            id: rsvp.id,
            guestId: rsvp.guest_id,
            firstName: rsvp.first_name || "Unknown",
            lastName: rsvp.last_name || "Guest",
            email: rsvp.email || "No email provided",
            attendance:
              rsvp.attendance === "attending"
                ? "Accepted"
                : rsvp.attendance === "not_attending"
                  ? "Declined"
                  : "Pending",
            invitedGuests: rsvp.number_of_guests,
            paymentReceived:
              paymentsByGuest.get(rsvp.guest_id || "") || 0,
            source: rsvp.source === "manual" ? "manual" : "automatic",
            message: rsvp.message || "",
            submitted: formatDateTime(rsvp.submitted_at),
          };
        })
      );

      setLoadingDashboard(false);
    };

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  useEffect(() => {
    if (checkingAccess) {
      return;
    }

    let warningTimer = 0;
    let logoutTimer = 0;

    const logoutForInactivity = async () => {
      await supabase.auth.signOut();
      router.replace("/");
    };

    const resetInactivityTimer = () => {
      window.clearTimeout(warningTimer);
      window.clearTimeout(logoutTimer);
      setSessionExpiryWarning(false);
      warningTimer = window.setTimeout(
        () => setSessionExpiryWarning(true),
        ADMIN_IDLE_TIMEOUT_MS - ADMIN_IDLE_WARNING_MS
      );
      logoutTimer = window.setTimeout(
        () => void logoutForInactivity(),
        ADMIN_IDLE_TIMEOUT_MS
      );
    };

    const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"] as const;
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, {
        passive: true,
      });
    });
    resetInactivityTimer();

    return () => {
      window.clearTimeout(warningTimer);
      window.clearTimeout(logoutTimer);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [checkingAccess, router, supabase]);

  const accepted = guests.filter(
    (guest) =>
      guest.attendance === "Accepted"
  ).length;

  const declined = guests.filter(
    (guest) =>
      guest.attendance === "Declined"
  ).length;

  const estimatedGuests = guests.reduce(
    (total, guest) =>
      guest.attendance === "Accepted"
        ? total + 1 + guest.invitedGuests
        : total,
    0
  );

  const totalContributions =
    contributions.reduce(
      (total, contribution) =>
        total + contribution.amount,
      0
    );

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const normalizedSearch =
        search.toLowerCase();

      const matchesSearch =
        `${guest.firstName} ${guest.lastName}`
          .toLowerCase()
          .includes(normalizedSearch) ||
        guest.email
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesFilter =
        filter === "All" ||
        guest.attendance === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [guests, search, filter]);

  const exportToExcel = async () => {
    try {
      const XLSX = await import(
        "xlsx"
      );

      const rows = guests.map(
        (guest) => ({
          "First Name":
            guest.firstName,
          "Last Name":
            guest.lastName,
          Email: guest.email,
          Attendance:
            guest.attendance,
          Source:
            guest.source === "manual"
              ? "Manual"
              : "Automatic",
          "Guests Coming Along":
            guest.invitedGuests,
          "Estimated Party Size":
            guest.attendance === "Accepted"
              ? guest.invitedGuests + 1
              : 0,
          "Payment Received":
            guest.paymentReceived,
          Message:
            guest.message,
          "Submitted At":
            guest.submitted,
        })
      );

      const worksheet =
        XLSX.utils.json_to_sheet(
          rows
        );

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "RSVPs"
      );

      XLSX.writeFile(
        workbook,
        "Elena-and-Marcus-Wedding-RSVPs.xlsx"
      );
    } catch (error) {
      console.error(
        "Excel export failed:",
        error
      );

      alert(
        "Excel export requires the xlsx package. Run: npm install xlsx"
      );
    }
  };

  const exportToPdf = async () => {
    await downloadWeddingReportPdf({
      title: "Wedding RSVP Report",
      filename: "Elena-and-Marcus-Wedding-RSVP-Report.pdf",
      metrics: [
        {
          label: "Total Responses",
          value: guests.length,
          detail: "People have responded",
          accent: "gold",
        },
        {
          label: "Accepted",
          value: accepted,
          detail: "Attending the wedding",
          accent: "green",
        },
        {
          label: "Declined",
          value: declined,
          detail: "Unable to attend",
          accent: "rose",
        },
        {
          label: "Estimated Guests",
          value: estimatedGuests,
          detail: "Including additional guests",
          accent: "cream",
        },
      ],
      columns: [
        "Guest",
        "Email",
        "Attendance",
        "Source",
        "Additional guests",
        "Note",
        "Submitted",
      ],
      rows: guests.map((guest) => [
        `${guest.firstName} ${guest.lastName}`,
        guest.email,
        guest.attendance,
        guest.source === "manual" ? "Manual" : "Automatic",
        guest.attendance === "Accepted"
          ? String(guest.invitedGuests)
          : "0",
        guest.message || "No note submitted.",
        guest.submitted,
      ]),
    });
  };

  const addManualRsvp = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setManualError("");
    setManualSaving(true);

    const formData = new FormData(event.currentTarget);
    const { error } = await supabase.rpc("add_manual_rsvp", {
      p_wedding_id: WEDDING_ID,
      p_first_name: String(formData.get("firstName") || "").trim(),
      p_last_name: String(formData.get("lastName") || "").trim(),
      p_email: String(formData.get("email") || "").trim(),
      p_phone: String(formData.get("phone") || "").trim(),
      p_attendance: String(formData.get("attendance") || "attending"),
      p_invited_guests: Number(
        formData.get("invitedGuests") || 0
      ),
      p_message: String(formData.get("message") || "").trim(),
    });

    if (error) {
      setManualError(
        error.code === "PGRST202"
          ? "Manual RSVP setup is not installed in Supabase yet. Run the manual RSVP SQL migration once."
          : error.message
      );
      setManualSaving(false);
      return;
    }

    window.location.reload();
  };

  const addManualContribution = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setContributionError("");
    setContributionSaving(true);

    const formData = new FormData(event.currentTarget);
    const { error } = await supabase.rpc(
      "add_manual_contribution",
      {
        p_wedding_id: WEDDING_ID,
        p_contributor_name: String(
          formData.get("contributorName") || ""
        ).trim(),
        p_amount: Number(formData.get("amount") || 0),
        p_payment_method: "M-Pesa",
        p_transaction_reference: String(
          formData.get("reference") || ""
        ).trim(),
        p_message: String(formData.get("message") || "").trim(),
      }
    );

    if (error) {
      setContributionError(
        error.code === "PGRST202"
          ? "Manual contribution setup is not installed in Supabase yet. Run the manual RSVP SQL migration once."
          : error.message
      );
      setContributionSaving(false);
      return;
    }

    window.location.reload();
  };

  const deleteGuest = async () => {
    if (!selectedGuest || deletingGuest) {
      return;
    }

    const guestName = `${selectedGuest.firstName} ${selectedGuest.lastName}`;
    const confirmed = window.confirm(
      `Delete ${guestName}? This permanently removes their RSVP and any linked payment records.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingGuest(true);
    const { error } = await supabase.rpc(
      "delete_wedding_guest",
      {
        p_guest_id: selectedGuest.guestId,
        p_wedding_id: WEDDING_ID,
      }
    );

    if (error) {
      alert(error.message);
      setDeletingGuest(false);
      return;
    }

    setSelectedGuest(null);
    window.location.reload();
  };

  const publishAnnouncement = () => {
    if (
      !announcement.title.trim() ||
      !announcement.message.trim()
    ) {
      alert(
        "Please enter both a title and message."
      );
      return;
    }

    alert(
      "Announcement published successfully."
    );

    setAnnouncement({
      title: "",
      message: "",
    });

    setShowAnnouncementForm(
      false
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const sidebarItems = [
    {
      id: "overview" as const,
      icon: "dashboard",
      label: "Overview",
    },
    {
      id: "rsvps" as const,
      icon: "how_to_reg",
      label: "RSVPs",
    },
    {
      id: "announcements" as const,
      icon: "campaign",
      label: "Announcements",
    },
    {
      id: "contributions" as const,
      icon: "payments",
      label: "Total Contributions",
    },
  ];

  if (checkingAccess) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">
            progress_activity
          </span>

          <p className="font-body-sm text-on-surface-variant mt-3">
            Checking admin access...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">

      {/* =====================================================
          FIXED SIDEBAR
      ====================================================== */}
      <aside
        className="
          hidden lg:flex
          fixed inset-y-0 left-0
          z-40
          w-64
          h-screen
          border-r border-outline-variant/20
          bg-surface
          flex-col
          overflow-hidden
        "
      >
        {/* Branding */}
        <div className="p-6 border-b border-outline-variant/15 shrink-0">
          <p className="font-label-caps text-label-caps text-primary mb-1">
            WEDDING ADMIN
          </p>

          <h1 className="font-headline-sm text-on-surface">
            Elena &amp; Marcus
          </h1>

          <p className="font-body-sm text-on-surface-variant mt-1">
            November 10, 2026
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setActiveSection(
                  item.id
                )
              }
              className={`
                w-full flex items-center gap-3
                px-4 py-3
                rounded-xl
                text-left
                transition-all
                ${
                  activeSection === item.id
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-primary/5 hover:text-primary"
                }
              `}
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>

              <span className="font-body-sm font-semibold">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-outline-variant/15 shrink-0">
          <button
            type="button"
            onClick={
              handleLogout
            }
            className="
              w-full flex items-center gap-3
              px-4 py-3 rounded-xl
              text-on-surface-variant
              hover:bg-red-50
              hover:text-red-600
              transition-all
            "
          >
            <span className="material-symbols-outlined">
              logout
            </span>

            <span className="font-body-sm font-semibold">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* =====================================================
          MOBILE ADMIN HEADER
      ====================================================== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface border-b border-outline-variant/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-label-caps text-label-caps text-primary">
              WEDDING ADMIN
            </p>

            <p className="font-headline-sm text-on-surface">
              Elena &amp; Marcus
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center"
            aria-label="Sign out"
          >
            <span className="material-symbols-outlined">
              logout
            </span>
          </button>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div className="lg:ml-64 min-h-screen">
        <div className="p-5 md:p-8 max-w-7xl mx-auto pt-24 lg:pt-8">

          {dataError && (
            <p
              role="alert"
              className="mb-6 rounded-xl bg-error-container px-4 py-3 font-body-sm text-on-error-container"
            >
              {dataError}
            </p>
          )}

          {sessionExpiryWarning && (
            <p
              role="status"
              className="mb-6 rounded-xl bg-primary-container px-4 py-3 font-body-sm text-on-primary-container"
            >
              For your security, you will be signed out in two minutes due to inactivity. Move the mouse, scroll, or interact with the page to stay signed in.
            </p>
          )}

          {loadingDashboard && (
            <p
              role="status"
              className="mb-6 flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 font-body-sm text-on-surface-variant"
            >
              <span className="material-symbols-outlined animate-spin text-primary">
                progress_activity
              </span>
              Loading the latest dashboard data...
            </p>
          )}

          {/* =================================================
              OVERVIEW
          ================================================== */}
          {activeSection ===
            "overview" && (
            <>
              <div className="rounded-3xl bg-surface border border-outline-variant/25 p-7 md:p-9 mb-7 shadow-[0_8px_28px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                  <div>
                    <p className="font-label-caps text-label-caps text-primary mb-2">
                      WELCOME BACK
                    </p>

                    <h2 className="font-display-sm text-on-surface mb-3">
                      Wedding overview
                    </h2>

                    <p className="font-body-md text-on-surface-variant max-w-2xl">
                      Keep track of RSVPs,
                      announcements and
                      wedding contributions
                      from one place.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection(
                        "rsvps"
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary rounded-full px-6 py-3 font-label-caps text-label-caps hover:brightness-110 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">
                      how_to_reg
                    </span>

                    View RSVPs
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-7">

                <StatCard
                  icon="groups"
                  label="RSVP Responses"
                  value={guests.length}
                  detail="Submitted RSVP forms"
                />

                <StatCard
                  icon="group"
                  label="Estimated Guests"
                  value={estimatedGuests}
                  detail="Accepted guests and their parties"
                  accent="green"
                />

                <StatCard
                  icon="check_circle"
                  label="Accepted"
                  value={
                    accepted
                  }
                  detail="Joyfully attending"
                  accent="green"
                />

                <StatCard
                  icon="cancel"
                  label="Declined"
                  value={declined}
                  detail="Unable to attend"
                  accent="red"
                />

                <StatCard
                  icon="payments"
                  label="Payments Received"
                  value={`KES ${totalContributions.toLocaleString()}`}
                  detail="Confirmed contributions"
                  accent="gold"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">

                <QuickAction
                  icon="campaign"
                  title="Send Announcement"
                  description="Publish an important update for your wedding guests."
                  button="Create Announcement"
                  onClick={() => {
                    setActiveSection(
                      "announcements"
                    );

                    setShowAnnouncementForm(
                      true
                    );
                  }}
                />

                <QuickAction
                  icon="payments"
                  title="Contributions"
                  description="View the total wedding contributions received."
                  button="View Contributions"
                  onClick={() =>
                    setActiveSection(
                      "contributions"
                    )
                  }
                />
              </div>

              {/* Recent RSVPs */}
              <SectionCard
                title="Recent RSVPs"
                action={
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection(
                        "rsvps"
                      )
                    }
                    className="text-primary font-body-sm hover:underline"
                  >
                    View all
                  </button>
                }
              >
                <GuestTable
                  guests={guests.slice(
                    0,
                    5
                  )}
                  onSelect={
                    setSelectedGuest
                  }
                />
              </SectionCard>
            </>
          )}

          {/* =================================================
              RSVPS
          ================================================== */}
          {activeSection === "rsvps" && (
            <SectionCard
              title="RSVPs"
              action={
                <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setManualError("");
                    setShowManualForm((current) => !current);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-tertiary text-on-tertiary px-5 py-2.5 font-label-caps text-label-caps hover:brightness-110 transition"
                >
                  <span className="material-symbols-outlined text-lg">
                    person_add
                  </span>

                  Add manually
                </button>
                <button
                  type="button"
                  onClick={
                    exportToExcel
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary px-5 py-2.5 font-label-caps text-label-caps hover:brightness-110 transition"
                >
                  <span className="material-symbols-outlined text-lg">
                    download
                  </span>

                  Export Excel
                </button>
                <button
                  type="button"
                  onClick={exportToPdf}
                  className="inline-flex items-center gap-2 rounded-full border border-primary text-primary px-5 py-2.5 font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition"
                >
                  <span className="material-symbols-outlined text-lg">
                    picture_as_pdf
                  </span>

                  Download PDF
                </button>
                </div>
              }
            >
              {showManualForm && (
                <form
                  onSubmit={addManualRsvp}
                  className="mb-7 rounded-2xl border border-tertiary/25 bg-tertiary/5 p-5 md:p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <p className="font-label-caps text-label-caps text-tertiary mb-1">
                        MANUAL RSVP
                      </p>
                      <h4 className="font-headline-sm text-on-surface">
                        Add a guest contacted directly
                      </h4>
                    </div>
                    <span className="rounded-full bg-tertiary/10 px-3 py-1 font-label-caps text-[11px] text-tertiary">
                      Manual source
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="firstName" required placeholder="First name *" className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-body-sm outline-none focus:border-tertiary" />
                    <input name="lastName" placeholder="Last name" className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-body-sm outline-none focus:border-tertiary" />
                    <input name="email" type="email" placeholder="Email address (optional)" className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-body-sm outline-none focus:border-tertiary" />
                    <input name="phone" type="tel" placeholder="WhatsApp / phone number" className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-body-sm outline-none focus:border-tertiary" />
                    <select name="attendance" defaultValue="attending" className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-body-sm outline-none focus:border-tertiary">
                      <option value="attending">Accepted</option>
                      <option value="not_attending">Declined</option>
                      <option value="maybe">Pending</option>
                    </select>
                    <input name="invitedGuests" type="number" min="0" defaultValue="0" placeholder="Additional guests" className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-body-sm outline-none focus:border-tertiary" />
                    <textarea name="message" rows={3} placeholder="Note for the couple" className="md:col-span-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-body-sm outline-none focus:border-tertiary resize-none" />
                  </div>

                  {manualError && (
                    <p role="alert" className="mt-4 rounded-xl bg-error-container px-4 py-3 font-body-sm text-on-error-container">
                      {manualError}
                    </p>
                  )}

                  <div className="mt-5 flex gap-3">
                    <button type="submit" disabled={manualSaving} className="rounded-full bg-tertiary px-6 py-3 font-label-caps text-label-caps text-on-tertiary disabled:opacity-50">
                      {manualSaving ? "Saving..." : "Save manual RSVP"}
                    </button>
                    <button type="button" onClick={() => setShowManualForm(false)} className="rounded-full border border-outline-variant/40 px-6 py-3 font-label-caps text-label-caps text-on-surface">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    search
                  </span>

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search guests..."
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest pl-12 pr-4 py-3 font-body-sm text-on-surface outline-none focus:border-primary transition"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(
                      e.target.value as
                        | "All"
                        | Attendance
                    )
                  }
                  className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-body-sm text-on-surface outline-none focus:border-primary"
                >
                  <option value="All">
                    All responses
                  </option>
                  <option value="Accepted">
                    Accepted
                  </option>
                  <option value="Declined">
                    Declined
                  </option>
                  <option value="Pending">
                    Pending
                  </option>
                </select>
              </div>

              <GuestTable
                guests={
                  filteredGuests
                }
                onSelect={
                  setSelectedGuest
                }
              />
            </SectionCard>
          )}

          {/* =================================================
              ANNOUNCEMENTS
          ================================================== */}
          {activeSection ===
            "announcements" && (
            <SectionCard
              title="Announcements"
              action={
                <button
                  type="button"
                  onClick={() =>
                    setShowAnnouncementForm(
                      true
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary px-5 py-2.5 font-label-caps text-label-caps hover:brightness-110 transition"
                >
                  <span className="material-symbols-outlined text-lg">
                    add
                  </span>

                  New Announcement
                </button>
              }
            >
              {showAnnouncementForm ? (
                <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-low p-6">
                  <div className="space-y-4">

                    <input
                      value={
                        announcement.title
                      }
                      onChange={(e) =>
                        setAnnouncement(
                          {
                            ...announcement,
                            title:
                              e.target.value,
                          }
                        )
                      }
                      placeholder="Announcement title"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 font-body-sm outline-none focus:border-primary"
                    />

                    <textarea
                      value={
                        announcement.message
                      }
                      onChange={(e) =>
                        setAnnouncement(
                          {
                            ...announcement,
                            message:
                              e.target.value,
                          }
                        )
                      }
                      placeholder="Write your announcement..."
                      rows={6}
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 font-body-sm outline-none focus:border-primary resize-none"
                    />

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={
                          publishAnnouncement
                        }
                        className="rounded-full bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps"
                      >
                        Publish
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowAnnouncementForm(
                            false
                          )
                        }
                        className="rounded-full border border-outline-variant/40 px-6 py-3 font-label-caps text-label-caps"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-outline-variant/30 p-10 text-center">
                  <span className="material-symbols-outlined text-4xl text-tertiary mb-3">
                    campaign
                  </span>

                  <h3 className="font-headline-sm text-on-surface mb-2">
                    No active announcements
                  </h3>

                  <p className="font-body-sm text-on-surface-variant max-w-md mx-auto">
                    Publish an announcement
                    when you need to communicate
                    an important update to your
                    guests.
                  </p>
                </div>
              )}
            </SectionCard>
          )}

          {/* =================================================
              CONTRIBUTIONS
          ================================================== */}
          {activeSection ===
            "contributions" && (
            <SectionCard
              title="Total Contributions"
              action={
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setContributionError("");
                      setShowContributionForm((current) => !current);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-tertiary px-5 py-2.5 font-label-caps text-label-caps text-on-tertiary hover:brightness-110"
                  >
                    <span className="material-symbols-outlined text-lg">
                      add_card
                    </span>
                    Add payment
                  </button>
                <div className="rounded-full bg-primary/10 px-5 py-2.5">
                  <span className="font-label-caps text-label-caps text-primary">
                    KES{" "}
                    {totalContributions.toLocaleString()}
                  </span>
                </div>
                </div>
              }
            >
              {showContributionForm && (
                <form
                  onSubmit={addManualContribution}
                  className="mb-7 rounded-2xl border border-tertiary/25 bg-tertiary/5 p-5 md:p-6"
                >
                  <p className="font-label-caps text-label-caps text-tertiary">
                    MANUAL M-PESA PAYMENT
                  </p>
                  <h4 className="mt-1 font-headline-sm text-on-surface">
                    Record a payment received to 0792 145 175
                  </h4>
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="contributorName" required placeholder="Contributor name *" className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-body-sm outline-none focus:border-tertiary" />
                    <div className="flex overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
                      <span className="flex items-center border-r border-outline-variant/30 px-4 font-body-sm font-semibold text-primary">KES</span>
                      <input name="amount" required type="number" min="1" placeholder="Amount received *" className="min-w-0 flex-1 px-4 py-3 font-body-sm outline-none" />
                    </div>
                    <input name="reference" placeholder="M-Pesa transaction reference (optional)" className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-body-sm outline-none focus:border-tertiary" />
                    <input value="M-Pesa" readOnly className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 font-body-sm text-on-surface-variant" />
                    <textarea name="message" rows={3} placeholder="Payment note (optional)" className="md:col-span-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-body-sm outline-none focus:border-tertiary resize-none" />
                  </div>
                  {contributionError && (
                    <p role="alert" className="mt-4 rounded-xl bg-error-container px-4 py-3 font-body-sm text-on-error-container">{contributionError}</p>
                  )}
                  <div className="mt-5 flex gap-3">
                    <button type="submit" disabled={contributionSaving} className="rounded-full bg-tertiary px-6 py-3 font-label-caps text-label-caps text-on-tertiary disabled:opacity-50">
                      {contributionSaving ? "Saving..." : "Record payment"}
                    </button>
                    <button type="button" onClick={() => setShowContributionForm(false)} className="rounded-full border border-outline-variant/40 px-6 py-3 font-label-caps text-label-caps text-on-surface">Cancel</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">

                <StatCard
                  icon="payments"
                  label="Total Received"
                  value={`KES ${totalContributions.toLocaleString()}`}
                  detail="Current contributions"
                  accent="gold"
                />

                <StatCard
                  icon="volunteer_activism"
                  label="Contributors"
                  value={
                    contributions.length
                  }
                  detail="Guests who contributed"
                  accent="green"
                />

                <StatCard
                  icon="trending_up"
                  label="Average"
                  value={`KES ${
                    Math.round(
                      totalContributions /
                        Math.max(
                          contributions.length,
                          1
                        )
                    ).toLocaleString()
                  }`}
                  detail="Average contribution"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-left border-b border-outline-variant/20">
                      <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
                        Contributor
                      </th>

                      <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
                        Amount
                      </th>

                      <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
                        Date
                      </th>

                      <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {contributions.map(
                      (item) => (
                        <tr
                          key={
                            item.id
                          }
                          className="border-b border-outline-variant/10"
                        >
                          <td className="px-4 py-4 font-body-sm font-semibold text-on-surface">
                            {item.contributor}
                          </td>

                          <td className="px-4 py-4 font-body-sm text-on-surface">
                            KES{" "}
                            {item.amount.toLocaleString()}
                          </td>

                          <td className="px-4 py-4 font-body-sm text-on-surface-variant">
                            {item.date}
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full bg-green-50 text-green-700 px-3 py-1 font-label-caps text-[11px]">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {/* =====================================================
          GUEST DETAILS MODAL
      ====================================================== */}
      {selectedGuest && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="w-full max-w-lg rounded-3xl bg-surface shadow-2xl border border-outline-variant/20 overflow-hidden">

            <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <p className="font-label-caps text-label-caps text-primary">
                  GUEST DETAILS
                </p>

                <h3 className="font-headline-md text-on-surface">
                  {
                    selectedGuest.firstName
                  }{" "}
                  {
                    selectedGuest.lastName
                  }
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedGuest(
                    null
                  )
                }
                className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:text-primary transition"
                aria-label="Close guest details"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <DetailRow
                icon="mail"
                label="Email"
                value={
                  selectedGuest.email
                }
              />

              <DetailRow
                icon="how_to_reg"
                label="Attendance"
                value={
                  selectedGuest.attendance
                }
              />

              <DetailRow
                icon="group_add"
                label="Guests Coming Along"
                value={String(selectedGuest.invitedGuests)}
              />

              <DetailRow
                icon="groups"
                label="Estimated Party Size"
                value={String(
                  selectedGuest.attendance === "Accepted"
                    ? selectedGuest.invitedGuests + 1
                    : 0
                )}
              />

              <DetailRow
                icon="payments"
                label="Payment Received"
                value={`KES ${selectedGuest.paymentReceived.toLocaleString()}`}
              />

              <div>
                <p className="font-label-caps text-label-caps text-primary mb-2">
                  MESSAGE
                </p>

                <p className="font-body-sm text-on-surface-variant leading-relaxed">
                  {
                    selectedGuest.message ||
                    "No message submitted."
                  }
                </p>
              </div>

              <DetailRow
                icon="schedule"
                label="Submitted"
                value={selectedGuest.submitted}
              />

              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`mailto:${selectedGuest.email}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary text-primary px-5 py-3 font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition"
                >
                  <span className="material-symbols-outlined">
                    mail
                  </span>

                  Email
                </a>

                <button
                  type="button"
                  onClick={deleteGuest}
                  disabled={deletingGuest}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-error text-error px-5 py-3 font-label-caps text-label-caps hover:bg-error hover:text-on-error transition disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">
                    delete
                  </span>
                  {deletingGuest ? "Deleting..." : "Delete guest"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon,
  label,
  value,
  detail,
  accent = "primary",
}: {
  icon: string;
  label: string;
  value: number | string;
  detail: string;
  accent?:
    | "primary"
    | "green"
    | "red"
    | "amber"
    | "gold";
}) {
  const styles = {
    primary:
      "bg-primary/10 text-primary",
    green:
      "bg-green-50 text-green-700",
    red:
      "bg-red-50 text-red-600",
    amber:
      "bg-amber-50 text-amber-700",
    gold:
      "bg-amber-50 text-amber-800",
  };

  return (
    <div className="rounded-2xl bg-surface border border-outline-variant/25 p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center mb-5 ${styles[accent]}`}
      >
        <span className="material-symbols-outlined">
          {icon}
        </span>
      </div>

      <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">
        {label}
      </p>

      <p className="font-display-sm text-on-surface mb-1">
        {value}
      </p>

      <p className="font-body-sm text-on-surface-variant">
        {detail}
      </p>
    </div>
  );
}

/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
  icon,
  title,
  description,
  button,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl bg-surface border border-outline-variant/25 p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
        <span className="material-symbols-outlined">
          {icon}
        </span>
      </div>

      <h3 className="font-headline-sm text-on-surface mb-2">
        {title}
      </h3>

      <p className="font-body-sm text-on-surface-variant leading-relaxed mb-5">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="text-primary font-label-caps text-label-caps hover:underline"
      >
        {button} →
      </button>
    </div>
  );
}

/* ============================================================
   SECTION CARD
============================================================ */

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-surface border border-outline-variant/25 shadow-[0_8px_28px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="p-6 md:p-7 border-b border-outline-variant/15 flex items-center justify-between gap-4">
        <h3 className="font-headline-md text-on-surface">
          {title}
        </h3>

        {action}
      </div>

      <div className="p-6 md:p-7">
        {children}
      </div>
    </section>
  );
}

/* ============================================================
   GUEST TABLE
============================================================ */

function GuestTable({
  guests,
  onSelect,
}: {
  guests: Guest[];
  onSelect: (guest: Guest) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1020px]">
        <thead>
          <tr className="text-left border-b border-outline-variant/20">
            <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
              Guest
            </th>

            <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
              Email
            </th>

            <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
              Attendance
            </th>

            <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
              Source
            </th>

            <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
              Guests
            </th>

            <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
              Note
            </th>

            <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
              Submitted
            </th>

            <th className="px-4 py-3" />
          </tr>
        </thead>

        <tbody>
          {guests.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-12 text-center text-on-surface-variant"
              >
                No guests found.
              </td>
            </tr>
          ) : (
            guests.map((guest) => (
              <tr
                key={guest.id}
                className="border-b border-outline-variant/10 hover:bg-primary/[0.02] transition"
              >
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() =>
                      onSelect(guest)
                    }
                    className="text-left"
                  >
                    <p className="font-body-sm font-semibold text-on-surface hover:text-primary">
                      {guest.firstName}{" "}
                      {guest.lastName}
                    </p>

                    <p className="font-body-sm text-on-surface-variant">
                      {guest.email}
                    </p>
                  </button>
                </td>

                <td className="px-4 py-4">
                  <span className="font-body-sm text-on-surface-variant">
                    {guest.email}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <StatusBadge
                    status={
                      guest.attendance
                    }
                  />
                </td>

                <td className="px-4 py-4">
                  <SourceBadge source={guest.source} />
                </td>

                <td className="px-4 py-4">
                  <span className="font-body-sm text-on-surface-variant">
                    {guest.attendance === "Accepted"
                      ? `${guest.invitedGuests} ${
                          guest.invitedGuests === 1
                            ? "guest"
                            : "guests"
                        }`
                      : "—"}
                  </span>
                </td>

                <td className="px-4 py-4 max-w-[240px]">
                  <span
                    className="block truncate font-body-sm text-on-surface-variant"
                    title={guest.message || "No note submitted."}
                  >
                    {guest.message || "No note submitted."}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span className="font-body-sm text-on-surface-variant">
                    {guest.submitted}
                  </span>
                </td>

                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      onSelect(guest)
                    }
                    className="w-9 h-9 rounded-full hover:bg-primary/10 hover:text-primary transition"
                    aria-label={`View ${guest.firstName} ${guest.lastName}`}
                  >
                    <span className="material-symbols-outlined">
                      more_horiz
                    </span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: Attendance;
}) {
  const styles = {
    Accepted:
      "bg-green-50 text-green-700",
    Declined:
      "bg-red-50 text-red-600",
    Pending:
      "bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-label-caps text-[11px] ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* ============================================================
   DETAIL ROW
============================================================ */

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="material-symbols-outlined text-primary">
        {icon}
      </span>

      <div>
        <p className="font-label-caps text-label-caps text-primary mb-1">
          {label}
        </p>

        <p className="font-body-sm text-on-surface">
          {value}
        </p>
      </div>
    </div>
  );
}

function SourceBadge({
  source,
}: {
  source: Guest["source"];
}) {
  const isManual = source === "manual";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-label-caps text-[11px] ${
        isManual
          ? "bg-tertiary/15 text-tertiary"
          : "bg-primary/10 text-primary"
      }`}
    >
      {isManual ? "Manual" : "Automatic"}
    </span>
  );
}
