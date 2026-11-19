import { and, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  activityLogs,
  appointments,
  chatMessages,
  providers,
  savedProviders,
  SuggestedSlotItem,
  users,
} from './schema.ts';

export const DEFAULT_PROFILE_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8khSLFuldWLgkIXhugR_jGVzxJosJa-Y7IH7ip9JtGgPNr0tCJxdeGak6U2MRW_yyExuL03kgdEG3FqLL2rKTBUcv7Vbuv1BDR2YRDiR89a3K5_kwsue9N6Dfq_s2_lLuRQGqML0CaRUpGtBEQpXqkmYvjbthAOfow0kaW6CzpJSsNbGGW2ceGCuj3DnTT1j3H4OgN89mCHgfEaGcgtJQY7L2w9zKFqkRagqhtKc';

const SEED_PROVIDERS = [
  {
    name: 'Dr. Julian Sterling',
    title: 'Senior Clinical Consultant & Specialist',
    specialty: 'Consultant Specialist',
    category: 'Consultations',
    location: 'Suite 402 · Main Facility (North Wing)',
    rating: '4.9',
    reviewCount: 128,
    feeInr: 1800,
    durationMin: 45,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_dm4EuIeGrqzDBrgjxH117RdaEuMXRnAR72RtHl6DsH06_DkqUBi-kMsuRhSgb1YpmKmyKerb8mkLpn9m6_TXMnHK1v4yKJcH_CNpMsCOR27p0_BdrTsMRiB20FkcPgwritj-xzly_nz6sOsD9jLpIg_nun0XdGrFM2aO7pccEB6ulzQxHQlSWMFWnvFRGpJBRebbLnvlV1JD1L16fXvHaNr1DhH7TTGM_xNULYU',
    badgeLabel: 'Executive Lead',
    nextAvailableLabel: 'Today 3:15 PM',
    availableToday: true,
    availableSlots: ['3:15 PM', '4:00 PM', '5:30 PM'],
    bio: 'Lead executive medical consultant specializing in preventive diagnostics, complex case coordination, and concierge care pathways.',
    isActive: true,
  },
  {
    name: 'Dr. Elena Rostova',
    title: 'Executive Wellness & Diagnostics',
    specialty: 'Integrative Health',
    category: 'Specialists',
    location: 'Wellness Pavilion · Diagnostics Suite 201',
    rating: '5.0',
    reviewCount: 94,
    feeInr: 2200,
    durationMin: 45,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBmLZaPy5kU6a9YNK-IyKamO4ZXxuJO7ILYSHVW1YTkib9hzY0Oh02U3LnQMd3PmXynBvw1F74rkTVjqQaHvZxM77YT5Q6W401bm2vmjvK2BDLEApOuYngFivTFvPWaChgM6wmfmlHGnOU8UaVADgck31i76KGQI90toevBbsA0PKBbe1Qys5yRp0jVZyEFFPYTkI40OihysrN8qI_vEmHdw-POciTmw1OmJ-EENoI',
    badgeLabel: 'Top Rated',
    nextAvailableLabel: 'Tomorrow 10:00 AM',
    availableToday: false,
    availableSlots: ['10:00 AM', '11:30 AM', '2:00 PM'],
    bio: 'Medical director for metabolic longevity, executive health panels, and personalized nutritional optimization.',
    isActive: true,
  },
  {
    name: 'Dr. Marcus Vance',
    title: 'Orthopedic & Sports Consultation',
    specialty: 'Neurology & Orthopedics',
    category: 'Specialists',
    location: 'North Wing · Surgical Wing 3B',
    rating: '4.8',
    reviewCount: 82,
    feeInr: 1600,
    durationMin: 45,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAGTCzk_wY126ShfWvOk5t2TOjRDwZuJ1TkQNYwa8k-cDoi8QWeQGC3fMAmGVuK7a034FWVHiM6Tp75ReZR8KEvhZbX8HIWtH1-BBhLjH_8rUSIsFclO0hHJ9ajT6BP246kZE2vP_zfmtEurmcrIEyR5pyXYiZd8HBq5UKxtnyEEr-EToxT9Ce8N1wpHROCc01FhVNyvL5QQjEM7WIrbfzEyiv42rAZQKnUAKXKW7c',
    badgeLabel: 'Verified Specialist',
    nextAvailableLabel: 'Today 4:00 PM',
    availableToday: true,
    availableSlots: ['4:00 PM', '4:45 PM', '6:15 PM'],
    bio: 'Senior associate specializing in musculoskeletal biomechanics, neurological recovery, and non-invasive joint preservation.',
    isActive: true,
  },
  {
    name: 'Sarah Lin, PT',
    title: 'Physical Therapy & Mobility Lead',
    specialty: 'Physical Therapy',
    category: 'Consultations',
    location: 'Wellness Pavilion · Studio B',
    rating: '4.9',
    reviewCount: 76,
    feeInr: 1400,
    durationMin: 60,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKsIigcS5KYkzdNwQxt34O7ZsZJbqDxIkgXHSSxpga1Hq-ccnLACU_fE76Gjqm5RBP8M7U4jlq7FDopLBNyzA12EcGNizuohAhj-tNahnTaL86ilipGpgYdPfniXZcBB0s92exApxBA2CflbK7Bog1ZKXTxVkS4OuspIjHWAAK8JUzEoRRmdb8VlJOyPUCNOn570lzVH9wz8VEwPZary7bICiaI_xRjReTCgjDhng',
    badgeLabel: 'Verified',
    nextAvailableLabel: 'Today 2:30 PM',
    availableToday: true,
    availableSlots: ['2:30 PM', '3:45 PM', '5:00 PM'],
    bio: 'Sports physiotherapist guiding executive mobility restoration, ergonomic alignment, and post-rehabilitation strength.',
    isActive: true,
  },
  {
    name: 'Dr. Arjun Venkatesh',
    title: 'Consultant Specialist · Chennai & Bengaluru',
    specialty: 'Internal Medicine',
    category: 'Consultations',
    location: 'Chennai Executive Suite · 45m Buffers',
    rating: '4.9',
    reviewCount: 112,
    feeInr: 1200,
    durationMin: 45,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDTcA-yf4O1P8ZJHgH7Bjbrk6nqHEdoYzeLDwS2XZiUDKmaNXACGwYQNWaIzg3Cbqq6GZ8D2O99OnnvzNZfuC7SYpBtlh6ni6qbu5nNalt8wlcgVU8e8lkvY4a921O6ZEFflxTRqwSNg4sIlmIl_CSmcmYWSUYnQsQFBf8c5Vwy9Be37_v7MFPm7Xowf2zXUYjCS1jkeAFGIz3WFiT8gBJc6cXf466BkPqdRxra7LE',
    badgeLabel: 'Executive Lead',
    nextAvailableLabel: 'Today 5:15 PM',
    availableToday: true,
    availableSlots: ['2:00 PM', '3:30 PM', '5:15 PM'],
    bio: 'Lead diagnostic physician serving Coimbatore, Chennai, and Bengaluru executive rosters with 45-minute clash-free buffers.',
    isActive: true,
  },
];

export async function ensureProvidersSeeded() {
  try {
    const existing = await db.select().from(providers);
    if (existing.length > 0) {
      return existing;
    }
    const inserted = await db.insert(providers).values(SEED_PROVIDERS).returning();
    return inserted;
  } catch (error) {
    console.error('Database error seeding providers:', error);
    throw new Error('Failed to load provider directory.', { cause: error });
  }
}

export async function getOrCreateUser(params: {
  uid: string;
  email: string;
  name: string;
  role?: string;
  tier?: string;
  avatarUrl?: string;
  city?: string;
}) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid: params.uid,
        email: params.email,
        name: params.name,
        role: params.role || 'customer',
        tier: params.tier || 'Executive Tier',
        avatarUrl: params.avatarUrl || DEFAULT_PROFILE_AVATAR,
        city: params.city || 'Bengaluru',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: params.email,
          name: params.name,
          ...(params.role ? { role: params.role } : {}),
          ...(params.avatarUrl ? { avatarUrl: params.avatarUrl } : {}),
          ...(params.city ? { city: params.city } : {}),
        },
      })
      .returning();

    const user = result[0];
    await ensureUserStarterData(user.uid, user.name);
    return user;
  } catch (error) {
    console.error('Database error upserting user:', error);
    throw new Error('Failed to synchronize user profile.', { cause: error });
  }
}

async function ensureUserStarterData(userUid: string, userName: string) {
  const allProviders = await ensureProvidersSeeded();
  const existingAppts = await db
    .select()
    .from(appointments)
    .where(eq(appointments.userUid, userUid));

  if (existingAppts.length === 0 && allProviders.length >= 4) {
    const leadDoc = allProviders[4] || allProviders[0];
    const ptDoc = allProviders[3] || allProviders[1];

    await db.insert(appointments).values([
      {
        userUid,
        customerName: userName,
        providerId: leadDoc.id,
        providerName: leadDoc.name,
        providerSpecialty: leadDoc.specialty,
        providerAvatar: leadDoc.avatarUrl,
        dateLabel: 'Thursday, Oct 26',
        timeSlot: '2:30 PM – 3:15 PM',
        durationMin: 45,
        location: leadDoc.location,
        status: 'Confirmed',
        notes: 'Executive quarterly consultation & health review',
        bookedViaAi: false,
      },
      {
        userUid,
        customerName: userName,
        providerId: ptDoc.id,
        providerName: ptDoc.name,
        providerSpecialty: ptDoc.specialty,
        providerAvatar: ptDoc.avatarUrl,
        dateLabel: 'Monday, Nov 02',
        timeSlot: '10:00 AM – 11:00 AM',
        durationMin: 60,
        location: ptDoc.location,
        status: 'Confirmed',
        notes: 'Mobility & posture optimization session',
        bookedViaAi: false,
      },
    ]);

    await db.insert(activityLogs).values([
      {
        userUid,
        icon: 'update',
        title: 'Appointment rescheduled',
        detail: `Moved to Oct 26 with ${leadDoc.name}`,
        timeLabel: '2h ago',
      },
      {
        userUid,
        icon: 'sms',
        title: 'Pre-check confirmed',
        detail: 'Digital intake verified for upcoming visit',
        timeLabel: 'Yesterday',
      },
    ]);
  }

  const existingChat = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userUid, userUid));

  if (existingChat.length === 0 && allProviders.length >= 3) {
    const p1 = allProviders[4] || allProviders[0];
    const p2 = allProviders[0];
    const p3 = allProviders[2];

    const starterSlots: SuggestedSlotItem[] = [
      {
        providerId: p1.id,
        providerName: p1.name,
        providerSpecialty: p1.specialty,
        providerAvatar: p1.avatarUrl,
        location: p1.location,
        dateLabel: 'Tuesday, Oct 31',
        timeSlot: '2:00 PM – 2:45 PM',
        durationMin: 45,
        tierLabel: 'Optimal Match',
        matchNote: 'Zero wait buffer',
        recommended: true,
      },
      {
        providerId: p2.id,
        providerName: p2.name,
        providerSpecialty: p2.specialty,
        providerAvatar: p2.avatarUrl,
        location: p2.location,
        dateLabel: 'Tuesday, Oct 31',
        timeSlot: '3:30 PM – 4:15 PM',
        durationMin: 45,
        tierLabel: 'Standard Routine',
        matchNote: 'Executive suite',
        recommended: false,
      },
      {
        providerId: p3.id,
        providerName: p3.name,
        providerSpecialty: p3.specialty,
        providerAvatar: p3.avatarUrl,
        location: p3.location,
        dateLabel: 'Tuesday, Oct 31',
        timeSlot: '4:45 PM – 5:30 PM',
        durationMin: 45,
        tierLabel: 'Affiliated Associate',
        matchNote: 'Senior Associate',
        recommended: false,
      },
    ];

    await db.insert(chatMessages).values([
      {
        userUid,
        sender: 'user',
        text: 'I need a consultation next Tuesday afternoon.',
        suggestedSlots: null,
      },
      {
        userUid,
        sender: 'assistant',
        text: 'I scanned clinician rosters and cross-referenced your time preferences. Found 3 clash-free slots for Tuesday, Oct 31 with certified partners:',
        suggestedSlots: starterSlots,
      },
    ]);
  }
}

export async function listProviders() {
  try {
    return await ensureProvidersSeeded();
  } catch (error) {
    console.error('Database error listing providers:', error);
    throw new Error('Failed to retrieve service providers.', { cause: error });
  }
}

export async function createProvider(input: {
  name: string;
  title: string;
  specialty: string;
  category: string;
  location: string;
  feeInr: number;
  durationMin: number;
  nextAvailableLabel: string;
  availableSlots: string[];
  bio: string;
}) {
  try {
    const [created] = await db
      .insert(providers)
      .values({
        name: input.name,
        title: input.title,
        specialty: input.specialty,
        category: input.category || 'Consultations',
        location: input.location,
        rating: '4.9',
        reviewCount: 12,
        feeInr: input.feeInr || 1500,
        durationMin: input.durationMin || 45,
        avatarUrl: SEED_PROVIDERS[0].avatarUrl,
        badgeLabel: 'Verified',
        nextAvailableLabel: input.nextAvailableLabel || 'Tomorrow 10:00 AM',
        availableToday: input.nextAvailableLabel.toLowerCase().includes('today'),
        availableSlots:
          input.availableSlots.length > 0
            ? input.availableSlots
            : ['10:00 AM', '2:00 PM', '4:30 PM'],
        bio: input.bio || 'Verified AUREVIA executive specialist.',
        isActive: true,
      })
      .returning();
    return created;
  } catch (error) {
    console.error('Database error creating provider:', error);
    throw new Error('Failed to register new provider.', { cause: error });
  }
}

export async function toggleProviderActive(providerId: number, isActive: boolean) {
  try {
    const [updated] = await db
      .update(providers)
      .set({ isActive })
      .where(eq(providers.id, providerId))
      .returning();
    return updated;
  } catch (error) {
    console.error('Database error updating provider status:', error);
    throw new Error('Failed to update provider availability.', { cause: error });
  }
}

export async function listAppointments(userUid: string, role: string) {
  try {
    if (role === 'admin') {
      return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
    }
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.userUid, userUid))
      .orderBy(desc(appointments.createdAt));
  } catch (error) {
    console.error('Database error fetching appointments:', error);
    throw new Error('Failed to load appointments.', { cause: error });
  }
}

export async function createAppointment(input: {
  userUid: string;
  customerName: string;
  providerId: number;
  dateLabel: string;
  timeSlot: string;
  notes?: string;
  bookedViaAi?: boolean;
}) {
  try {
    const [provider] = await db
      .select()
      .from(providers)
      .where(eq(providers.id, input.providerId));

    if (!provider) {
      throw new Error('Selected provider was not found.');
    }

    const [created] = await db
      .insert(appointments)
      .values({
        userUid: input.userUid,
        customerName: input.customerName,
        providerId: provider.id,
        providerName: provider.name,
        providerSpecialty: provider.specialty,
        providerAvatar: provider.avatarUrl,
        dateLabel: input.dateLabel,
        timeSlot: input.timeSlot,
        durationMin: provider.durationMin,
        location: provider.location,
        status: 'Confirmed',
        notes: input.notes || 'Booked via AUREVIA portal',
        bookedViaAi: Boolean(input.bookedViaAi),
      })
      .returning();

    await db.insert(activityLogs).values({
      userUid: input.userUid,
      icon: input.bookedViaAi ? 'auto_awesome' : 'event_available',
      title: input.bookedViaAi ? 'AI Concierge reservation confirmed' : 'Appointment booked',
      detail: `${input.dateLabel} · ${input.timeSlot} with ${provider.name}`,
      timeLabel: 'Just now',
    });

    return created;
  } catch (error) {
    console.error('Database error creating appointment:', error);
    throw new Error('Failed to reserve appointment slot.', { cause: error });
  }
}

export async function rescheduleAppointment(
  appointmentId: number,
  userUid: string,
  role: string,
  dateLabel: string,
  timeSlot: string
) {
  try {
    const whereClause =
      role === 'admin'
        ? eq(appointments.id, appointmentId)
        : and(eq(appointments.id, appointmentId), eq(appointments.userUid, userUid));

    const [updated] = await db
      .update(appointments)
      .set({
        dateLabel,
        timeSlot,
        status: 'Confirmed',
      })
      .where(whereClause)
      .returning();

    if (!updated) {
      throw new Error('Appointment not found or access denied.');
    }

    await db.insert(activityLogs).values({
      userUid: updated.userUid,
      icon: 'update',
      title: 'Appointment rescheduled',
      detail: `Moved to ${dateLabel} (${timeSlot}) with ${updated.providerName}`,
      timeLabel: 'Just now',
    });

    return updated;
  } catch (error) {
    console.error('Database error rescheduling appointment:', error);
    throw new Error('Failed to reschedule appointment.', { cause: error });
  }
}

export async function updateAppointmentStatus(
  appointmentId: number,
  userUid: string,
  role: string,
  status: 'Confirmed' | 'Cancelled' | 'Completed'
) {
  try {
    const whereClause =
      role === 'admin'
        ? eq(appointments.id, appointmentId)
        : and(eq(appointments.id, appointmentId), eq(appointments.userUid, userUid));

    const [updated] = await db
      .update(appointments)
      .set({ status })
      .where(whereClause)
      .returning();

    if (!updated) {
      throw new Error('Appointment not found or access denied.');
    }

    await db.insert(activityLogs).values({
      userUid: updated.userUid,
      icon: status === 'Cancelled' ? 'event_busy' : 'check_circle',
      title: `Appointment ${status.toLowerCase()}`,
      detail: `${updated.dateLabel} · ${updated.providerName}`,
      timeLabel: 'Just now',
    });

    return updated;
  } catch (error) {
    console.error('Database error updating appointment status:', error);
    throw new Error('Failed to update appointment status.', { cause: error });
  }
}

export async function listActivityLogs(userUid: string) {
  try {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userUid, userUid))
      .orderBy(desc(activityLogs.createdAt))
      .limit(12);
  } catch (error) {
    console.error('Database error fetching activity logs:', error);
    throw new Error('Failed to fetch activity logs.', { cause: error });
  }
}

export async function listSavedProviderIds(userUid: string): Promise<number[]> {
  try {
    const rows = await db
      .select()
      .from(savedProviders)
      .where(eq(savedProviders.userUid, userUid));
    return rows.map((r) => r.providerId);
  } catch (error) {
    console.error('Database error fetching saved providers:', error);
    throw new Error('Failed to load saved providers.', { cause: error });
  }
}

export async function toggleSavedProvider(userUid: string, providerId: number) {
  try {
    const existing = await db
      .select()
      .from(savedProviders)
      .where(
        and(
          eq(savedProviders.userUid, userUid),
          eq(savedProviders.providerId, providerId)
        )
      );
    if (existing.length > 0) {
      await db.delete(savedProviders).where(eq(savedProviders.id, existing[0].id));
      return { saved: false };
    }
    await db.insert(savedProviders).values({ userUid, providerId });
    return { saved: true };
  } catch (error) {
    console.error('Database error toggling saved provider:', error);
    throw new Error('Failed to update saved provider.', { cause: error });
  }
}

export async function listChatMessages(userUid: string) {
  try {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userUid, userUid))
      .orderBy(chatMessages.id);
  } catch (error) {
    console.error('Database error fetching chat history:', error);
    throw new Error('Failed to load AI booking conversation.', { cause: error });
  }
}

export async function appendChatMessage(input: {
  userUid: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestedSlots?: SuggestedSlotItem[] | null;
}) {
  try {
    const [created] = await db
      .insert(chatMessages)
      .values({
        userUid: input.userUid,
        sender: input.sender,
        text: input.text,
        suggestedSlots: input.suggestedSlots || null,
      })
      .returning();
    return created;
  } catch (error) {
    console.error('Database error appending chat message:', error);
    throw new Error('Failed to save conversation message.', { cause: error });
  }
}

export async function updateUserRole(uid: string, role: 'customer' | 'provider' | 'admin') {
  try {
    const [updated] = await db
      .update(users)
      .set({ role })
      .where(eq(users.uid, uid))
      .returning();
    return updated;
  } catch (error) {
    console.error('Database error updating user role:', error);
    throw new Error('Failed to update workspace role.', { cause: error });
  }
}
