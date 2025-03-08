import { expect, test } from "bun:test";
import { generateTimeSlotsForDate, generateTimeSlotsForDateRange } from "./timeSlots";

test("generateTimeSlotsForDate returns empty array for disabled day", () => {
  const date = new Date("2023-01-02"); // Monday
  const event = {
    id: "test-event",
    userId: "user-id",
    type: "test",
    title: "Test Event",
    description: "Test Description",
    duration: 30,
    bufferTime: 5,
    isActive: true,
    requiresConfirmation: false,
    userName: "testuser",
    createdAt: new Date(),
    updatedAt: null
  };
  const availability = {
    id: "test-availability",
    userId: "user-id",
    timeZone: "UTC",
    weeklySchedule: {
      "0": { start: 600, end: 1020, enabled: false }, // Monday disabled
      "1": { start: 600, end: 1020, enabled: true },
      "2": { start: 600, end: 1020, enabled: true },
      "3": { start: 600, end: 1020, enabled: true },
      "4": { start: 600, end: 1020, enabled: true },
      "5": { start: 600, end: 1020, enabled: false },
      "6": { start: 600, end: 1020, enabled: false }
    },
    createdAt: new Date(),
    updatedAt: null
  };

  const slots = generateTimeSlotsForDate(date, event, availability);
  expect(slots).toEqual([]);
});

test("generateTimeSlotsForDate generates correct slots for enabled day", () => {
  // Tuesday, January 3rd 2023
  const date = new Date("2023-01-03");
  const event = {
    id: "test-event",
    userId: "user-id",
    type: "test",
    title: "Test Event",
    description: "Test Description",
    duration: 30, // 30 minutes
    bufferTime: 5, // 5 minutes buffer
    isActive: true,
    requiresConfirmation: false,
    userName: "testuser",
    createdAt: new Date(),
    updatedAt: null
  };
  const availability = {
    id: "test-availability",
    userId: "user-id",
    timeZone: "UTC",
    weeklySchedule: {
      "0": { start: 600, end: 1020, enabled: true }, // Monday
      "1": { start: 600, end: 660, enabled: true }, // Tuesday 10:00-11:00
      "2": { start: 600, end: 1020, enabled: true },
      "3": { start: 600, end: 1020, enabled: true },
      "4": { start: 600, end: 1020, enabled: true },
      "5": { start: 600, end: 1020, enabled: false },
      "6": { start: 600, end: 1020, enabled: false }
    },
    createdAt: new Date(),
    updatedAt: null
  };

  const slots = generateTimeSlotsForDate(date, event, availability);

  // Should have 2 slots: 10:00-10:30 and 10:15-10:45
  expect(slots.length).toBe(2);

  // First slot should start at 10:00 and end at 10:30
  expect(slots[0].start.getHours()).toBe(10);
  expect(slots[0].start.getMinutes()).toBe(0);
  expect(slots[0].end.getHours()).toBe(10);
  expect(slots[0].end.getMinutes()).toBe(30);

  // Second slot should start at 10:15 and end at 10:45
  expect(slots[1].start.getHours()).toBe(10);
  expect(slots[1].start.getMinutes()).toBe(15);
  expect(slots[1].end.getHours()).toBe(10);
  expect(slots[1].end.getMinutes()).toBe(45);
});

test("generateTimeSlotsForDate respects existing bookings", () => {
  // Tuesday, January 3rd 2023
  const date = new Date("2023-01-03");
  const event = {
    id: "test-event",
    userId: "user-id",
    type: "test",
    title: "Test Event",
    description: "Test Description",
    duration: 30, // 30 minutes
    bufferTime: 5, // 5 minutes buffer
    isActive: true,
    requiresConfirmation: false,
    userName: "testuser",
    createdAt: new Date(),
    updatedAt: null
  };
  const availability = {
    id: "test-availability",
    userId: "user-id",
    timeZone: "UTC",
    weeklySchedule: {
      "0": { start: 600, end: 1020, enabled: true },
      "1": { start: 600, end: 720, enabled: true }, // Tuesday 10:00-12:00
      "2": { start: 600, end: 1020, enabled: true },
      "3": { start: 600, end: 1020, enabled: true },
      "4": { start: 600, end: 1020, enabled: true },
      "5": { start: 600, end: 1020, enabled: false },
      "6": { start: 600, end: 1020, enabled: false }
    },
    createdAt: new Date(),
    updatedAt: null
  };

  // Existing booking from 10:30 to 11:00
  const existingBookings = [
    {
      start: new Date("2023-01-03T10:30:00Z"),
      end: new Date("2023-01-03T11:00:00Z")
    }
  ];

  const slots = generateTimeSlotsForDate(date, event, availability, existingBookings);

  // Verify we have the expected slots
  // Should have slots at 10:00, 10:15, 11:05, 11:20, 11:35
  expect(slots.length).toBe(5);

  // Check that the slots are at the expected times
  // First slot: 10:00-10:30
  expect(slots[0].start.getHours()).toBe(10);
  expect(slots[0].start.getMinutes()).toBe(0);
  expect(slots[0].end.getHours()).toBe(10);
  expect(slots[0].end.getMinutes()).toBe(30);

  // Second slot: 10:15-10:45
  expect(slots[1].start.getHours()).toBe(10);
  expect(slots[1].start.getMinutes()).toBe(15);
  expect(slots[1].end.getHours()).toBe(10);
  expect(slots[1].end.getMinutes()).toBe(45);

  // Third slot: 11:05-11:35
  expect(slots[2].start.getHours()).toBe(11);
  expect(slots[2].start.getMinutes()).toBe(5);
  expect(slots[2].end.getHours()).toBe(11);
  expect(slots[2].end.getMinutes()).toBe(35);

  // Fourth slot: 11:20-11:50
  expect(slots[3].start.getHours()).toBe(11);
  expect(slots[3].start.getMinutes()).toBe(20);
  expect(slots[3].end.getHours()).toBe(11);
  expect(slots[3].end.getMinutes()).toBe(50);

  // Fifth slot: 11:35-12:05
  expect(slots[4].start.getHours()).toBe(11);
  expect(slots[4].start.getMinutes()).toBe(35);
  expect(slots[4].end.getHours()).toBe(12);
  expect(slots[4].end.getMinutes()).toBe(5);
});

test("generateTimeSlotsForDateRange generates slots for multiple days", () => {
  // Monday-Wednesday, January 2-4, 2023
  const startDate = new Date("2023-01-02");
  const endDate = new Date("2023-01-04");
  const event = {
    id: "test-event",
    userId: "user-id",
    type: "test",
    title: "Test Event",
    description: "Test Description",
    duration: 30,
    bufferTime: 5,
    isActive: true,
    requiresConfirmation: false,
    userName: "testuser",
    createdAt: new Date(),
    updatedAt: null
  };
  const availability = {
    id: "test-availability",
    userId: "user-id",
    timeZone: "UTC",
    weeklySchedule: {
      "0": { start: 600, end: 660, enabled: true }, // Monday 10:00-11:00
      "1": { start: 600, end: 660, enabled: true }, // Tuesday 10:00-11:00
      "2": { start: 600, end: 660, enabled: false }, // Wednesday disabled
      "3": { start: 600, end: 1020, enabled: true },
      "4": { start: 600, end: 1020, enabled: true },
      "5": { start: 600, end: 1020, enabled: false },
      "6": { start: 600, end: 1020, enabled: false }
    },
    createdAt: new Date(),
    updatedAt: null
  };

  const slotsMap = generateTimeSlotsForDateRange(startDate, endDate, event, availability);

  // Should have slots for Monday and Tuesday, but not Wednesday
  expect(Object.keys(slotsMap).length).toBe(3);
  expect(slotsMap["2023-01-02"].length).toBeGreaterThan(0); // Monday
  expect(slotsMap["2023-01-03"].length).toBeGreaterThan(0); // Tuesday
  expect(slotsMap["2023-01-04"].length).toBe(0); // Wednesday (disabled)
});
