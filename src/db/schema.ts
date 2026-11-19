import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull().default('Anita Sample'),
  role: text('role').notNull().default('customer'), // 'customer' | 'provider' | 'admin'
  tier: text('tier').notNull().default('Executive Tier'),
  avatarUrl: text('avatar_url'),
  city: text('city').default('Bengaluru'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const providers = pgTable('providers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  specialty: text('specialty').notNull(),
  category: text('category').notNull().default('Consultations'),
  location: text('location').notNull(),
  rating: text('rating').notNull().default('4.9'),
  reviewCount: integer('review_count').notNull().default(84),
  feeInr: integer('fee_inr').notNull().default(1200),
  durationMin: integer('duration_min').notNull().default(45),
  avatarUrl: text('avatar_url').notNull(),
  badgeLabel: text('badge_label').notNull().default('Verified'),
  nextAvailableLabel: text('next_available_label').notNull(),
  availableToday: boolean('available_today').notNull().default(true),
  availableSlots: jsonb('available_slots').$type<string[]>().notNull().default([]),
  bio: text('bio').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  customerName: text('customer_name').notNull(),
  providerId: integer('provider_id')
    .references(() => providers.id)
    .notNull(),
  providerName: text('provider_name').notNull(),
  providerSpecialty: text('provider_specialty').notNull(),
  providerAvatar: text('provider_avatar').notNull(),
  dateLabel: text('date_label').notNull(),
  timeSlot: text('time_slot').notNull(),
  durationMin: integer('duration_min').notNull().default(45),
  location: text('location').notNull(),
  status: text('status').notNull().default('Confirmed'), // 'Confirmed' | 'Rescheduled' | 'Cancelled' | 'Completed'
  notes: text('notes'),
  bookedViaAi: boolean('booked_via_ai').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  icon: text('icon').notNull().default('event_available'),
  title: text('title').notNull(),
  detail: text('detail').notNull(),
  timeLabel: text('time_label').notNull().default('Just now'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const savedProviders = pgTable('saved_providers', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  providerId: integer('provider_id')
    .references(() => providers.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export interface SuggestedSlotItem {
  providerId: number;
  providerName: string;
  providerSpecialty: string;
  providerAvatar: string;
  location: string;
  dateLabel: string;
  timeSlot: string;
  durationMin: number;
  tierLabel: string;
  matchNote: string;
  recommended?: boolean;
}

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  sender: text('sender').notNull(), // 'user' | 'assistant'
  text: text('text').notNull(),
  suggestedSlots: jsonb('suggested_slots').$type<SuggestedSlotItem[]>(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const providersRelations = relations(providers, ({ many }) => ({
  appointments: many(appointments),
  savedBy: many(savedProviders),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  provider: one(providers, {
    fields: [appointments.providerId],
    references: [providers.id],
  }),
}));

export const savedProvidersRelations = relations(savedProviders, ({ one }) => ({
  provider: one(providers, {
    fields: [savedProviders.providerId],
    references: [providers.id],
  }),
}));
