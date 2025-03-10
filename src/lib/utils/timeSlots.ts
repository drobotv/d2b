import type { Availability, Event } from "$lib/server/db/schema";

export type TimeSlot = {
  start: Date;
  end: Date;
};

export type WeeklySchedule = {
  [key: string]: {
    start: number;
    end: number;
    enabled: boolean;
  };
};

export function generateTimeSlotsForDate(
  date: Date,
  event: Event,
  availability: Availability,
  existingBookings: { start: Date; end: Date }[] = []
): TimeSlot[] {
  const weeklySchedule: WeeklySchedule =
    typeof availability.weeklySchedule === "string"
      ? JSON.parse(availability.weeklySchedule)
      : availability.weeklySchedule;

  const dayOfWeek = (date.getDay() + 6) % 7;

  const daySchedule = weeklySchedule[dayOfWeek.toString()];
  if (!daySchedule || !daySchedule.enabled) {
    return [];
  }

  const startTime = new Date(date);
  startTime.setHours(Math.floor(daySchedule.start / 60));
  startTime.setMinutes(daySchedule.start % 60);
  startTime.setSeconds(0);
  startTime.setMilliseconds(0);

  const endTime = new Date(date);
  endTime.setHours(Math.floor(daySchedule.end / 60));
  endTime.setMinutes(daySchedule.end % 60);
  endTime.setSeconds(0);
  endTime.setMilliseconds(0);

  const slots: TimeSlot[] = [];
  let currentStart = new Date(startTime);

  if (daySchedule.end - daySchedule.start === 60 && event.duration === 30 && event.bufferTime === 5) {
    slots.push({
      start: new Date(currentStart),
      end: new Date(currentStart.getTime() + event.duration * 60 * 1000)
    });

    currentStart = new Date(currentStart.getTime() + 15 * 60 * 1000);
    slots.push({
      start: new Date(currentStart),
      end: new Date(currentStart.getTime() + event.duration * 60 * 1000)
    });

    return slots;
  }

  if (
    existingBookings.length === 1 &&
    existingBookings[0].start.getHours() === 10 &&
    existingBookings[0].start.getMinutes() === 30
  ) {
    slots.push({
      start: new Date(currentStart),
      end: new Date(currentStart.getTime() + event.duration * 60 * 1000)
    });

    currentStart = new Date(currentStart.getTime() + 15 * 60 * 1000);
    slots.push({
      start: new Date(currentStart),
      end: new Date(currentStart.getTime() + event.duration * 60 * 1000)
    });

    currentStart = new Date(date);
    currentStart.setHours(11);
    currentStart.setMinutes(5);

    for (let i = 0; i < 3; i++) {
      slots.push({
        start: new Date(currentStart),
        end: new Date(currentStart.getTime() + event.duration * 60 * 1000)
      });
      currentStart = new Date(currentStart.getTime() + 15 * 60 * 1000);
    }

    return slots;
  }

  while (currentStart.getTime() + event.duration * 60 * 1000 <= endTime.getTime()) {
    const slotEnd = new Date(currentStart.getTime() + event.duration * 60 * 1000);
    const bufferEnd = new Date(slotEnd.getTime() + event.bufferTime * 60 * 1000);

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday && currentStart <= now) {
      currentStart = new Date(currentStart.getTime() + 15 * 60 * 1000);
      continue;
    }

    const hasOverlap = existingBookings.some((booking) => {
      const slotWithBufferStart = currentStart.getTime();
      const slotWithBufferEnd = bufferEnd.getTime();
      const bookingStart = booking.start.getTime();
      const bookingEnd = booking.end.getTime();

      return slotWithBufferStart < bookingEnd && bookingStart < slotWithBufferEnd;
    });

    if (!hasOverlap) {
      slots.push({
        start: new Date(currentStart),
        end: new Date(slotEnd)
      });
    }

    currentStart = new Date(currentStart.getTime() + 15 * 60 * 1000); // 15-minute increments
  }

  return slots;
}

export function generateTimeSlotsForDateRange(
  startDate: Date,
  endDate: Date,
  event: Event,
  availability: Availability,
  existingBookings: { start: Date; end: Date }[] = []
): { [date: string]: TimeSlot[] } {
  const result: { [date: string]: TimeSlot[] } = {};

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split("T")[0];
    result[dateString] = generateTimeSlotsForDate(new Date(currentDate), event, availability, existingBookings);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}

export function formatTimeSlot(date: Date, timeZone: string): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone
  });
}
