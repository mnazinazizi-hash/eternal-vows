"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Attendance =
  | "Accepted"
  | "Declined"
  | "Pending";

type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  attendance: Attendance;
  invitedGuests: number;
  paymentReceived: number;
  message: string;
  submitted: string;
};

type Contribution = {
  id: string;
  contributor: string;
  amount: number;
  date: string;
  status: "Received" | "Pending";
};

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [
    checkingAccess,
    setCheckingAccess,
  ] = useState(true);

  // These will be populated from Supabase in the next phase.
  const guests: Guest[] = [];
  const contributions: Contribution[] = [];

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
     SUPABASE AUTH ACCESS CHECK
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

      if (mounted) {
        setCheckingAccess(false);
      }
    };

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

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
              }
            >
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
                <div className="rounded-full bg-primary/10 px-5 py-2.5">
                  <span className="font-label-caps text-label-caps text-primary">
                    KES{" "}
                    {totalContributions.toLocaleString()}
                  </span>
                </div>
              }
            >
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

              <div className="pt-3">
                <a
                  href={`mailto:${selectedGuest.email}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-primary text-primary px-5 py-3 font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition"
                >
                  <span className="material-symbols-outlined">
                    mail
                  </span>

                  Email
                </a>
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
      <table className="w-full min-w-[920px]">
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
                colSpan={7}
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
