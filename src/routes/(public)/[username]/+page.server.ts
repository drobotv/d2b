import { m } from "$lib/i18n";
import { db } from "$lib/server/db";
import { availabilityTable, eventsTable, locationTable, userTable } from "$lib/server/db/schema";
import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

export async function load({ params }) {
  const { username } = params;

  let user = (await db
    .select({
      id: userTable.id,
      username: userTable.username,
      firstName: userTable.firstName,
      lastName: userTable.lastName,
      bio: userTable.bio
    })
    .from(userTable)
    .where(eq(userTable.username, username))
    .get()) || { id: null };

  if (!user.id) {
    return error(404, { message: m.page_not_found() });
  }

  const { events, availability, location } = await db.transaction(async (tx) => {
    const events = await tx
      .select({
        userName: eventsTable.userName,
        title: eventsTable.title,
        type: eventsTable.type, // used for links to the events via [username]/[event_type], use localizeHref() from $lib/paraglide/runtime
        description: eventsTable.description,
        duration: eventsTable.duration,
        bufferTime: eventsTable.bufferTime,
        requiresConfirmation: eventsTable.requiresConfirmation
      })
      .from(eventsTable)
      .where(and(eq(eventsTable.isActive, true), eq(eventsTable.userId, user.id)));

    const [availability] = await tx
      .select({
        timeZone: availabilityTable.timeZone,
        weeklySchedule: availabilityTable.weeklySchedule
      })
      .from(availabilityTable)
      .where(eq(availabilityTable.userId, user.id));

    const [location] = await tx
      .select({
        name: locationTable.name,
        address: locationTable.address,
        description: locationTable.description,
        lat: locationTable.lat,
        lng: locationTable.lng,
        boundingBox: locationTable.boundingBox
      })
      .from(locationTable)
      .where(eq(locationTable.userId, user.id));
    return { events, availability, location };
  });

  if (!events.length || !availability) {
    return error(404, { message: m.page_not_found() });
  }

  return {
    user,
    events,
    availability,
    location
  };
}
