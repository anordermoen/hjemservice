"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin, Ban, Check, Loader2, CalendarDays, Clock, Settings, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { addBlockedDate, removeBlockedDate, updateSchedule } from "@/app/actions/availability";

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
  "Januar",
  "Februar",
  "Mars",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function ProviderCalendarClient({
  bookings,
  blockedDates,
  schedule,
  initialDate,
}: ProviderCalendarClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentDate, setCurrentDate] = useState(() => {
    const [year, month] = initialDate.split("-").map(Number);
    return new Date(year, month - 1, 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleSlot[]>(schedule);

  // Time options for dropdowns (30-minute intervals)
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Get starting day (adjust for Monday start)
  let startingDay = firstDayOfMonth.getDay() - 1;
  if (startingDay < 0) startingDay = 6;

  const days: (number | null)[] = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToMonth = (newYear: number, newMonth: number) => {
    setCurrentDate(new Date(newYear, newMonth, 1));
    setMonthPickerOpen(false);
  };

  // Generate year options (5 years back, 5 years forward)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const formatDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  // Check if provider works on a specific day of week
  const worksOnDay = (dayOfWeek: number) => {
    return schedule.some((s) => s.dayOfWeek === dayOfWeek && s.isActive);
  };

  // Get working hours for a day
  const getWorkingHours = (dayOfWeek: number) => {
    const slots = schedule.filter((s) => s.dayOfWeek === dayOfWeek && s.isActive);
    if (slots.length === 0) return "Ikke tilgjengelig";
    return slots.map((s) => `${s.startTime}-${s.endTime}`).join(", ");
  };

  const selectedAppointments = selectedDate ? bookings[selectedDate] || [] : [];
  const isSelectedDateBlocked = selectedDate ? !!blockedDates[selectedDate] : false;
  const selectedDateBlockReason = selectedDate ? blockedDates[selectedDate] : "";
  const todayKey = new Date().toISOString().split("T")[0];

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
      // Add default slot
      setEditingSchedule([
        ...editingSchedule,
        { dayOfWeek, startTime: "09:00", endTime: "17:00", isActive: true },
      ]);
    } else {
      // Toggle isActive for all slots of this day
      const allActive = daySlots.every((s) => s.isActive);
      setEditingSchedule(
        editingSchedule.map((s) =>
          s.dayOfWeek === dayOfWeek ? { ...s, isActive: !allActive } : s
        )
      );
    }
  };

  const updateSlotTime = (
    dayOfWeek: number,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const daySlots = getScheduleForDay(dayOfWeek);
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
    const newStart = lastSlot ? lastSlot.endTime : "09:00";
    const newEnd = lastSlot ? "17:00" : "17:00";
    setEditingSchedule([
      ...editingSchedule,
      { dayOfWeek, startTime: newStart, endTime: newEnd, isActive: true },
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
      // Group by day and save each day
      const dayGroups = new Map<number, ScheduleSlot[]>();
      for (let i = 0; i <= 6; i++) {
        dayGroups.set(i, []);
      }
      editingSchedule.forEach((slot) => {
        dayGroups.get(slot.dayOfWeek)?.push(slot);
      });

      for (const [dayOfWeek, slots] of dayGroups) {
        await updateSchedule(
          dayOfWeek,
          slots.map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            isActive: s.isActive,
          }))
        );
      }

      setScheduleDialogOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Kalender</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={openScheduleDialog}>
              <Clock className="mr-2 h-4 w-4" />
              Arbeidstider
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <button
                onClick={() => setMonthPickerOpen(true)}
                className="min-w-[140px] text-center font-medium hover:bg-muted px-3 py-1.5 rounded-md transition-colors"
              >
                {monthNames[month]} {year}
              </button>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Day names */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="p-2" />;
              }

              const dateKey = formatDateKey(day);
              const hasAppointments = bookings[dateKey]?.length > 0;
              const isBlocked = !!blockedDates[dateKey];
              const isSelected = selectedDate === dateKey;
              const isToday = todayKey === dateKey;

              // Get day of week (0=Sunday, but we display Mon first)
              const dateObj = new Date(year, month, day);
              const dayOfWeek = dateObj.getDay();
              const isWorkDay = worksOnDay(dayOfWeek);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateKey)}
                  className={cn(
                    "relative rounded-lg p-2 text-center transition-colors hover:bg-muted",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                    isToday && !isSelected && "ring-2 ring-primary",
                    isBlocked && !isSelected && "bg-red-100 text-red-800",
                    !isWorkDay && !isBlocked && !isSelected && "text-muted-foreground/50"
                  )}
                >
                  <span className="text-sm">{day}</span>
                  {hasAppointments && (
                    <span
                      className={cn(
                        "absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                        isSelected ? "bg-primary-foreground" : "bg-primary"
                      )}
                    />
                  )}
                  {isBlocked && !isSelected && (
                    <Ban className="absolute top-1 right-1 h-3 w-3 text-red-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Har avtaler</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded ring-2 ring-primary" />
              <span>I dag</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-red-100" />
              <span>Blokkert</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected day details */}
      <Card>
        <CardHeader>
          <CardTitle>
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
                    <p className="mt-1 text-sm text-red-600">
                      {selectedDateBlockReason}
                    </p>
                  )}
                </div>
              )}

              {/* Appointments */}
              {selectedAppointments.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {selectedAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{appointment.time}</span>
                        <Badge
                          variant="default"
                          className={appointment.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                        >
                          {appointment.status === "confirmed"
                            ? "Bekreftet"
                            : "Venter"}
                        </Badge>
                      </div>
                      <p className="mt-1 font-medium">{appointment.service}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.customerName}
                      </p>
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
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleUnblockDate}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
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

      {/* Block date dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blokker dato</DialogTitle>
            <DialogDescription>
              Blokker{" "}
              {selectedDate &&
                new Date(selectedDate).toLocaleDateString("nb-NO", {
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
            <Button
              variant="outline"
              onClick={() => setBlockDialogOpen(false)}
              disabled={isPending}
            >
              Avbryt
            </Button>
            <Button onClick={handleBlockDate} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Blokker dato
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
                <Label htmlFor="month-select" className="text-sm text-muted-foreground">
                  Måned
                </Label>
                <Select
                  value={month.toString()}
                  onValueChange={(value) => goToMonth(year, parseInt(value))}
                >
                  <SelectTrigger id="month-select" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((name, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year-select" className="text-sm text-muted-foreground">
                  År
                </Label>
                <Select
                  value={year.toString()}
                  onValueChange={(value) => goToMonth(parseInt(value), month)}
                >
                  <SelectTrigger id="year-select" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
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
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => toggleDayActive(dayOfWeek)}
                      />
                      <span className={cn(
                        "font-medium",
                        !isActive && "text-muted-foreground"
                      )}>
                        {fullDayNames[dayOfWeek]}
                      </span>
                    </div>
                    {isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addSlotToDay(dayOfWeek)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {isActive && daySlots.length > 0 && (
                    <div className="space-y-2 ml-10">
                      {daySlots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-2">
                          <Select
                            value={slot.startTime}
                            onValueChange={(value) =>
                              updateSlotTime(dayOfWeek, slotIndex, "startTime", value)
                            }
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground">-</span>
                          <Select
                            value={slot.endTime}
                            onValueChange={(value) =>
                              updateSlotTime(dayOfWeek, slotIndex, "endTime", value)
                            }
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
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

                  {!isActive && (
                    <p className="text-sm text-muted-foreground ml-10">
                      Ikke tilgjengelig
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleDialogOpen(false)}
              disabled={isPending}
            >
              Avbryt
            </Button>
            <Button onClick={handleSaveSchedule} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Lagre endringer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
