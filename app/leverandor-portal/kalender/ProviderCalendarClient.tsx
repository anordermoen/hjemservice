"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Ban,
  Check,
  Loader2,
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  Calendar,
  List,
  CalendarRange,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { addBlockedDate, removeBlockedDate, updateSchedule, addBlockedDateRange } from "@/app/actions/availability";

interface Appointment {
  id: string;
  time: string;
  customerName: string;
  service: string;
  address: string;
  status: "confirmed" | "pending";
}

interface ScheduleSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface ProviderCalendarClientProps {
  bookings: Record<string, Appointment[]>;
  blockedDates: Record<string, string>;
  schedule: ScheduleSlot[];
  initialDate: string;
}

const dayNames = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const fullDayNames = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
const monthNames = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];
const shortMonthNames = [
  "Jan", "Feb", "Mar", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Des",
];

type ViewType = "month" | "year" | "list";

export function ProviderCalendarClient({
  bookings,
  blockedDates,
  schedule,
  initialDate,
}: ProviderCalendarClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // View state
  const [currentView, setCurrentView] = useState<ViewType>("month");
  const [currentDate, setCurrentDate] = useState(() => {
    const [year, month] = initialDate.split("-").map(Number);
    return new Date(year, month - 1, 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);

  // Dialog states
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);

  // Period blocking state
  const [periodStart, setPeriodStart] = useState<string>("");
  const [periodEnd, setPeriodEnd] = useState<string>("");
  const [periodReason, setPeriodReason] = useState("");

  // Selection mode for shift+click
  const [selectionStart, setSelectionStart] = useState<string | null>(null);

  const [editingSchedule, setEditingSchedule] = useState<ScheduleSlot[]>(schedule);

  // Time options for dropdowns (30-minute intervals)
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const todayKey = new Date().toISOString().split("T")[0];

  // Helper functions
  const formatDateKey = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  const worksOnDay = (dayOfWeek: number) => {
    return schedule.some((s) => s.dayOfWeek === dayOfWeek && s.isActive);
  };

  const getWorkingHours = (dayOfWeek: number) => {
    const slots = schedule.filter((s) => s.dayOfWeek === dayOfWeek && s.isActive);
    if (slots.length === 0) return "Ikke tilgjengelig";
    return slots.map((s) => `${s.startTime}-${s.endTime}`).join(", ");
  };

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getStartingDay = (y: number, m: number) => {
    let day = new Date(y, m, 1).getDay() - 1;
    return day < 0 ? 6 : day;
  };

  // Navigation
  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToPreviousYear = () => setCurrentDate(new Date(year - 1, month, 1));
  const goToNextYear = () => setCurrentDate(new Date(year + 1, month, 1));
  const goToMonth = (newYear: number, newMonth: number) => {
    setCurrentDate(new Date(newYear, newMonth, 1));
    setMonthPickerOpen(false);
  };

  // Day click handler with shift support
  const handleDayClick = (dateKey: string, event: React.MouseEvent) => {
    if (event.shiftKey && selectionStart) {
      // Complete period selection
      const start = selectionStart < dateKey ? selectionStart : dateKey;
      const end = selectionStart < dateKey ? dateKey : selectionStart;
      setPeriodStart(start);
      setPeriodEnd(end);
      setPeriodDialogOpen(true);
      setSelectionStart(null);
    } else if (event.shiftKey) {
      // Start period selection
      setSelectionStart(dateKey);
      setSelectedDate(dateKey);
    } else {
      setSelectionStart(null);
      setSelectedDate(dateKey);
    }
  };

  // Blocking handlers
  const handleBlockDate = () => {
    if (!selectedDate) return;
    startTransition(async () => {
      const result = await addBlockedDate(selectedDate, blockReason);
      if (result.success) {
        setBlockDialogOpen(false);
        setBlockReason("");
        router.refresh();
      }
    });
  };

  const handleUnblockDate = () => {
    if (!selectedDate) return;
    startTransition(async () => {
      const result = await removeBlockedDate(selectedDate);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const handleBlockPeriod = () => {
    if (!periodStart || !periodEnd) return;
    startTransition(async () => {
      const result = await addBlockedDateRange(periodStart, periodEnd, periodReason);
      if (result.success) {
        setPeriodDialogOpen(false);
        setPeriodStart("");
        setPeriodEnd("");
        setPeriodReason("");
        router.refresh();
      }
    });
  };

  // Calculate days between dates
  const getDaysBetween = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // Get blocked periods for list view
  const getBlockedPeriods = () => {
    const sorted = Object.entries(blockedDates).sort(([a], [b]) => a.localeCompare(b));
    const periods: Array<{ start: string; end: string; reason: string; days: number }> = [];

    if (sorted.length === 0) return periods;

    let periodStart = sorted[0][0];
    let periodEnd = sorted[0][0];
    let periodReason = sorted[0][1];

    for (let i = 1; i < sorted.length; i++) {
      const [date, reason] = sorted[i];
      const prevDate = new Date(periodEnd);
      const currDate = new Date(date);
      prevDate.setDate(prevDate.getDate() + 1);

      if (prevDate.getTime() === currDate.getTime() && periodReason === reason) {
        periodEnd = date;
      } else {
        periods.push({
          start: periodStart,
          end: periodEnd,
          reason: periodReason,
          days: getDaysBetween(periodStart, periodEnd),
        });
        periodStart = date;
        periodEnd = date;
        periodReason = reason;
      }
    }

    // Push the last period
    periods.push({
      start: periodStart,
      end: periodEnd,
      reason: periodReason,
      days: getDaysBetween(periodStart, periodEnd),
    });

    return periods.filter((p) => new Date(p.end) >= new Date(todayKey));
  };

  // Schedule editing
  const openScheduleDialog = () => {
    setEditingSchedule([...schedule]);
    setScheduleDialogOpen(true);
  };

  const getScheduleForDay = (dayOfWeek: number) => {
    return editingSchedule.filter((s) => s.dayOfWeek === dayOfWeek);
  };

  const toggleDayActive = (dayOfWeek: number) => {
    const daySlots = getScheduleForDay(dayOfWeek);
    if (daySlots.length === 0) {
      setEditingSchedule([
        ...editingSchedule,
        { dayOfWeek, startTime: "09:00", endTime: "17:00", isActive: true },
      ]);
    } else {
      const allActive = daySlots.every((s) => s.isActive);
      setEditingSchedule(
        editingSchedule.map((s) =>
          s.dayOfWeek === dayOfWeek ? { ...s, isActive: !allActive } : s
        )
      );
    }
  };

  const updateSlotTime = (dayOfWeek: number, slotIndex: number, field: "startTime" | "endTime", value: string) => {
    let slotCount = 0;
    setEditingSchedule(
      editingSchedule.map((s) => {
        if (s.dayOfWeek === dayOfWeek) {
          if (slotCount === slotIndex) {
            slotCount++;
            return { ...s, [field]: value };
          }
          slotCount++;
        }
        return s;
      })
    );
  };

  const addSlotToDay = (dayOfWeek: number) => {
    const daySlots = getScheduleForDay(dayOfWeek);
    const lastSlot = daySlots[daySlots.length - 1];
    setEditingSchedule([
      ...editingSchedule,
      { dayOfWeek, startTime: lastSlot?.endTime || "09:00", endTime: "17:00", isActive: true },
    ]);
  };

  const removeSlotFromDay = (dayOfWeek: number, slotIndex: number) => {
    let slotCount = 0;
    setEditingSchedule(
      editingSchedule.filter((s) => {
        if (s.dayOfWeek === dayOfWeek) {
          if (slotCount === slotIndex) {
            slotCount++;
            return false;
          }
          slotCount++;
        }
        return true;
      })
    );
  };

  const handleSaveSchedule = () => {
    startTransition(async () => {
      const dayGroups = new Map<number, ScheduleSlot[]>();
      for (let i = 0; i <= 6; i++) dayGroups.set(i, []);
      editingSchedule.forEach((slot) => dayGroups.get(slot.dayOfWeek)?.push(slot));

      for (const [dayOfWeek, slots] of dayGroups) {
        await updateSchedule(dayOfWeek, slots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive,
        })));
      }
      setScheduleDialogOpen(false);
      router.refresh();
    });
  };

  // Render day cell for both month and year views
  const renderDayCell = (dateKey: string, day: number, compact: boolean = false) => {
    const hasAppointments = bookings[dateKey]?.length > 0;
    const isBlocked = !!blockedDates[dateKey];
    const isSelected = selectedDate === dateKey;
    const isToday = todayKey === dateKey;
    const isInSelection = selectionStart && (
      (selectionStart <= dateKey && dateKey <= selectedDate!) ||
      (selectedDate! <= dateKey && dateKey <= selectionStart)
    );
    const dateObj = new Date(dateKey);
    const isWorkDay = worksOnDay(dateObj.getDay());

    if (compact) {
      return (
        <button
          key={dateKey}
          onClick={(e) => handleDayClick(dateKey, e)}
          title={`${day}. ${monthNames[dateObj.getMonth()]} - ${isBlocked ? "Blokkert" : isWorkDay ? "Tilgjengelig" : "Jobber ikke"}`}
          className={cn(
            "h-3 w-3 rounded-sm transition-colors",
            isToday && "ring-1 ring-primary ring-offset-1",
            isBlocked ? "bg-red-400" : isWorkDay ? "bg-green-400" : "bg-gray-200",
            hasAppointments && "ring-1 ring-blue-500"
          )}
        />
      );
    }

    return (
      <button
        key={dateKey}
        onClick={(e) => handleDayClick(dateKey, e)}
        className={cn(
          "relative rounded-lg p-2 text-center transition-colors hover:bg-muted",
          isSelected && "bg-primary text-primary-foreground hover:bg-primary",
          isToday && !isSelected && "ring-2 ring-primary",
          isBlocked && !isSelected && "bg-red-100 text-red-800",
          isWorkDay && !isBlocked && !isSelected && "bg-green-50",
          !isWorkDay && !isBlocked && !isSelected && "bg-gray-50 text-muted-foreground/50",
          isInSelection && !isSelected && "bg-primary/20"
        )}
      >
        <span className="text-sm">{day}</span>
        {hasAppointments && (
          <span className={cn(
            "absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full",
            isSelected ? "bg-primary-foreground" : "bg-blue-500"
          )} />
        )}
        {isBlocked && !isSelected && (
          <Ban className="absolute top-1 right-1 h-3 w-3 text-red-600" />
        )}
      </button>
    );
  };

  // Selected date info
  const selectedAppointments = selectedDate ? bookings[selectedDate] || [] : [];
  const isSelectedDateBlocked = selectedDate ? !!blockedDates[selectedDate] : false;
  const selectedDateBlockReason = selectedDate ? blockedDates[selectedDate] : "";

  return (
    <div className="space-y-4">
      {/* View selector and actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as ViewType)}>
          <TabsList>
            <TabsTrigger value="month" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Måned</span>
            </TabsTrigger>
            <TabsTrigger value="year" className="gap-2">
              <CalendarRange className="h-4 w-4" />
              <span className="hidden sm:inline">År</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Liste</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setPeriodDialogOpen(true)}>
            <Ban className="mr-2 h-4 w-4" />
            Blokker periode
          </Button>
          <Button variant="outline" size="sm" onClick={openScheduleDialog}>
            <Clock className="mr-2 h-4 w-4" />
            Arbeidstider
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main calendar area */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">
              {currentView === "year" ? year : `${monthNames[month]} ${year}`}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={currentView === "year" ? goToPreviousYear : goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <button
                onClick={() => setMonthPickerOpen(true)}
                className="min-w-[100px] text-center text-sm font-medium hover:bg-muted px-3 py-1.5 rounded-md transition-colors"
              >
                {currentView === "year" ? year : shortMonthNames[month]}
              </button>
              <Button
                variant="outline"
                size="icon"
                onClick={currentView === "year" ? goToNextYear : goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Month View */}
            {currentView === "month" && (
              <>
                <div className="grid grid-cols-7 gap-1">
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: getStartingDay(year, month) }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2" />
                  ))}
                  {Array.from({ length: getDaysInMonth(year, month) }).map((_, i) => {
                    const day = i + 1;
                    const dateKey = formatDateKey(year, month, day);
                    return renderDayCell(dateKey, day);
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-green-50 border" />
                    <span>Tilgjengelig</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-red-100 border" />
                    <span>Blokkert</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-gray-50 border" />
                    <span>Jobber ikke</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>Har avtaler</span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Tips: Hold Shift og klikk for å velge en periode
                </p>
              </>
            )}

            {/* Year View */}
            {currentView === "year" && (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                {Array.from({ length: 12 }).map((_, monthIndex) => (
                  <div
                    key={monthIndex}
                    className="cursor-pointer rounded-lg border p-2 hover:border-primary transition-colors"
                    onClick={() => {
                      setCurrentDate(new Date(year, monthIndex, 1));
                      setCurrentView("month");
                    }}
                  >
                    <h4 className="mb-2 text-sm font-medium">{shortMonthNames[monthIndex]}</h4>
                    <div className="grid grid-cols-7 gap-0.5">
                      {/* Mini day headers */}
                      {["M", "T", "O", "T", "F", "L", "S"].map((d, i) => (
                        <div key={i} className="h-3 w-3 text-[8px] text-center text-muted-foreground">
                          {d}
                        </div>
                      ))}
                      {/* Empty cells for starting day */}
                      {Array.from({ length: getStartingDay(year, monthIndex) }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-3 w-3" />
                      ))}
                      {/* Days */}
                      {Array.from({ length: getDaysInMonth(year, monthIndex) }).map((_, i) => {
                        const day = i + 1;
                        const dateKey = formatDateKey(year, monthIndex, day);
                        return renderDayCell(dateKey, day, true);
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {currentView === "list" && (
              <div className="space-y-4">
                <h3 className="font-medium">Blokkerte perioder</h3>
                {getBlockedPeriods().length > 0 ? (
                  <div className="space-y-2">
                    {getBlockedPeriods().map((period, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <div className="font-medium">
                            {new Date(period.start).toLocaleDateString("nb-NO", {
                              day: "numeric",
                              month: "short",
                            })}
                            {period.start !== period.end && (
                              <>
                                {" - "}
                                {new Date(period.end).toLocaleDateString("nb-NO", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {period.days} dag{period.days > 1 ? "er" : ""}
                            {period.reason && ` • ${period.reason}`}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            // Remove each day in the period
                            startTransition(async () => {
                              const start = new Date(period.start);
                              const end = new Date(period.end);
                              for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                                await removeBlockedDate(d.toISOString().split("T")[0]);
                              }
                              router.refresh();
                            });
                          }}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    Ingen blokkerte perioder
                  </p>
                )}

                <h3 className="font-medium pt-4">Kommende avtaler</h3>
                {Object.entries(bookings)
                  .filter(([date]) => date >= todayKey)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .slice(0, 10)
                  .length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(bookings)
                      .filter(([date]) => date >= todayKey)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .slice(0, 10)
                      .map(([date, apps]) => (
                        <div key={date} className="rounded-lg border p-3">
                          <div className="font-medium">
                            {new Date(date).toLocaleDateString("nb-NO", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </div>
                          {apps.map((app) => (
                            <div key={app.id} className="mt-2 text-sm text-muted-foreground">
                              {app.time} - {app.service} ({app.customerName})
                            </div>
                          ))}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    Ingen kommende avtaler
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected day details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate
                ? new Date(selectedDate).toLocaleDateString("nb-NO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "Velg en dag"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate && (
              <>
                {/* Working hours info */}
                {(() => {
                  const dateObj = new Date(selectedDate);
                  const dayOfWeek = dateObj.getDay();
                  const hours = getWorkingHours(dayOfWeek);
                  return (
                    <div className="mb-4 p-3 rounded-lg bg-muted/50 text-sm">
                      <span className="text-muted-foreground">Arbeidstid: </span>
                      <span className="font-medium">{hours}</span>
                    </div>
                  );
                })()}

                {/* Blocked status */}
                {isSelectedDateBlocked && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2 text-red-800 font-medium">
                      <Ban className="h-4 w-4" />
                      Denne dagen er blokkert
                    </div>
                    {selectedDateBlockReason && (
                      <p className="mt-1 text-sm text-red-600">{selectedDateBlockReason}</p>
                    )}
                  </div>
                )}

                {/* Appointments */}
                {selectedAppointments.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {selectedAppointments.map((appointment) => (
                      <div key={appointment.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{appointment.time}</span>
                          <Badge
                            className={appointment.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                          >
                            {appointment.status === "confirmed" ? "Bekreftet" : "Venter"}
                          </Badge>
                        </div>
                        <p className="mt-1 font-medium">{appointment.service}</p>
                        <p className="text-sm text-muted-foreground">{appointment.customerName}</p>
                        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {appointment.address}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : !isSelectedDateBlocked ? (
                  <p className="py-4 text-center text-muted-foreground mb-4">
                    Ingen avtaler denne dagen
                  </p>
                ) : null}

                {/* Block/Unblock buttons */}
                {isSelectedDateBlocked ? (
                  <Button className="w-full" variant="outline" onClick={handleUnblockDate} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Fjern blokkering
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setBlockDialogOpen(true)}
                    disabled={isPending || selectedAppointments.length > 0}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Blokker denne dagen
                  </Button>
                )}

                {selectedAppointments.length > 0 && !isSelectedDateBlocked && (
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Kan ikke blokkere dager med eksisterende avtaler
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Block single date dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blokker dato</DialogTitle>
            <DialogDescription>
              Blokker{" "}
              {selectedDate && new Date(selectedDate).toLocaleDateString("nb-NO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              . Du vil ikke motta bestillinger for denne dagen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Årsak (valgfritt)</Label>
              <Input
                id="reason"
                placeholder="F.eks. Ferie, sykdom, etc."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button onClick={handleBlockDate} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Blokker dato
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block period dialog */}
      <Dialog open={periodDialogOpen} onOpenChange={setPeriodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blokker periode</DialogTitle>
            <DialogDescription>
              Velg start- og sluttdato for perioden du ønsker å blokkere.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="periodStart">Fra dato</Label>
                <Input
                  id="periodStart"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  min={todayKey}
                />
              </div>
              <div>
                <Label htmlFor="periodEnd">Til dato</Label>
                <Input
                  id="periodEnd"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  min={periodStart || todayKey}
                />
              </div>
            </div>
            {periodStart && periodEnd && (
              <p className="text-sm text-muted-foreground">
                {getDaysBetween(periodStart, periodEnd)} dag{getDaysBetween(periodStart, periodEnd) > 1 ? "er" : ""} vil bli blokkert
              </p>
            )}
            <div>
              <Label htmlFor="periodReason">Årsak (valgfritt)</Label>
              <Input
                id="periodReason"
                placeholder="F.eks. Ferie, jul, etc."
                value={periodReason}
                onChange={(e) => setPeriodReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPeriodDialogOpen(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button onClick={handleBlockPeriod} disabled={isPending || !periodStart || !periodEnd}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Blokker periode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Month/Year picker dialog */}
      <Dialog open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
        <DialogContent className="sm:max-w-[340px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Velg måned og år
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">Måned</Label>
                <Select value={month.toString()} onValueChange={(v) => goToMonth(year, parseInt(v))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((name, i) => (
                      <SelectItem key={i} value={i.toString()}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">År</Label>
                <Select value={year.toString()} onValueChange={(v) => goToMonth(parseInt(v), month)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const today = new Date();
                goToMonth(today.getFullYear(), today.getMonth());
              }}
            >
              Gå til i dag
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule editor dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Rediger arbeidstider
            </DialogTitle>
            <DialogDescription>
              Angi når du er tilgjengelig for bookinger hver dag.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
              const daySlots = getScheduleForDay(dayOfWeek);
              const isActive = daySlots.length > 0 && daySlots.some((s) => s.isActive);

              return (
                <div key={dayOfWeek} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Switch checked={isActive} onCheckedChange={() => toggleDayActive(dayOfWeek)} />
                      <span className={cn("font-medium", !isActive && "text-muted-foreground")}>
                        {fullDayNames[dayOfWeek]}
                      </span>
                    </div>
                    {isActive && (
                      <Button variant="ghost" size="sm" onClick={() => addSlotToDay(dayOfWeek)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {isActive && daySlots.length > 0 && (
                    <div className="space-y-2 ml-10">
                      {daySlots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-2">
                          <Select value={slot.startTime} onValueChange={(v) => updateSlotTime(dayOfWeek, slotIndex, "startTime", v)}>
                            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground">-</span>
                          <Select value={slot.endTime} onValueChange={(v) => updateSlotTime(dayOfWeek, slotIndex, "endTime", v)}>
                            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {daySlots.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeSlotFromDay(dayOfWeek, slotIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!isActive && <p className="text-sm text-muted-foreground ml-10">Ikke tilgjengelig</p>}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button onClick={handleSaveSchedule} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lagre endringer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
