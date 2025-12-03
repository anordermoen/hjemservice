"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  time: string;
  customerName: string;
  service: string;
  address: string;
  status: "confirmed" | "pending";
}

interface ProviderCalendarClientProps {
  bookings: Record<string, Appointment[]>;
  initialDate: string;
}

const dayNames = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
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

export function ProviderCalendarClient({ bookings, initialDate }: ProviderCalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const [year, month] = initialDate.split("-").map(Number);
    return new Date(year, month - 1, 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);

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

  const formatDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const selectedAppointments = selectedDate ? bookings[selectedDate] || [] : [];
  const todayKey = new Date().toISOString().split("T")[0];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Kalender</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-medium">
              {monthNames[month]} {year}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
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
              const isSelected = selectedDate === dateKey;
              const isToday = todayKey === dateKey;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateKey)}
                  className={cn(
                    "relative rounded-lg p-2 text-center transition-colors hover:bg-muted",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                    isToday && !isSelected && "ring-2 ring-primary"
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
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Har avtaler</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded ring-2 ring-primary" />
              <span>I dag</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected day appointments */}
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
          {selectedAppointments.length > 0 ? (
            <div className="space-y-3">
              {selectedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{appointment.time}</span>
                    <Badge
                      variant={
                        appointment.status === "confirmed"
                          ? "default"
                          : "secondary"
                      }
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
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              Ingen avtaler denne dagen
            </p>
          )}

          <Button className="mt-4 w-full" variant="outline">
            Sett utilgjengelig
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
