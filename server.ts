import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  AuthRequest,
  requireAuth,
  signPersonaToken,
} from './src/middleware/auth.ts';
import {
  appendChatMessage,
  createAppointment,
  createProvider,
  DEFAULT_PROFILE_AVATAR,
  getOrCreateUser,
  listActivityLogs,
  listAppointments,
  listChatMessages,
  listProviders,
  listSavedProviderIds,
  rescheduleAppointment,
  toggleProviderActive,
  toggleSavedProvider,
  updateAppointmentStatus,
  updateUserRole,
} from './src/db/repository.ts';
import type { SuggestedSlotItem } from './src/db/schema.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEMO_PERSONAS: Record<
  string,
  {
    uid: string;
    email: string;
    name: string;
    role: 'customer' | 'provider' | 'admin';
    city: string;
    tier: string;
    avatarUrl: string;
  }
> = {
  'kavya.menon@example.in': {
    uid: 'persona_kavya_menon',
    email: 'kavya.menon@example.in',
    name: 'Kavya Menon',
    role: 'customer',
    city: 'Bengaluru',
    tier: 'Executive Tier',
    avatarUrl: DEFAULT_PROFILE_AVATAR,
  },
  'arjun.venkatesh@clinic.in': {
    uid: 'persona_arjun_venkatesh',
    email: 'arjun.venkatesh@clinic.in',
    name: 'Dr. Arjun Venkatesh',
    role: 'provider',
    city: 'Chennai',
    tier: 'Consultant Lead',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDTcA-yf4O1P8ZJHgH7Bjbrk6nqHEdoYzeLDwS2XZiUDKmaNXACGwYQNWaIzg3Cbqq6GZ8D2O99OnnvzNZfuC7SYpBtlh6ni6qbu5nNalt8wlcgVU8e8lkvY4a921O6ZEFflxTRqwSNg4sIlmIl_CSmcmYWSUYnQsQFBf8c5Vwy9Be37_v7MFPm7Xowf2zXUYjCS1jkeAFGIz3WFiT8gBJc6cXf466BkPqdRxra7LE',
  },
  'rohit.admin@aurevia.in': {
    uid: 'persona_rohit_sharma',
    email: 'rohit.admin@aurevia.in',
    name: 'Rohit Sharma',
    role: 'admin',
    city: 'Mumbai',
    tier: 'Multi-Clinic Admin',
    avatarUrl: DEFAULT_PROFILE_AVATAR,
  },
  'rohit.admin@samay.in': {
    uid: 'persona_rohit_sharma',
    email: 'rohit.admin@aurevia.in',
    name: 'Rohit Sharma',
    role: 'admin',
    city: 'Mumbai',
    tier: 'Multi-Clinic Admin',
    avatarUrl: DEFAULT_PROFILE_AVATAR,
  },
};

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/auth/persona-login', async (req, res) => {
    try {
      const { email, role } = req.body as {
        email?: string;
        role?: 'customer' | 'provider' | 'admin';
      };

      const normalizedEmail = (email || 'kavya.menon@example.in').trim().toLowerCase();
      const matchedPersona = DEMO_PERSONAS[normalizedEmail];

      const persona = matchedPersona
        ? {
            ...matchedPersona,
            role: role || matchedPersona.role,
          }
        : {
            uid: `persona_${normalizedEmail.replace(/[^a-z0-9]/g, '_')}`,
            email: normalizedEmail,
            name:
              normalizedEmail
                .split('@')[0]
                .split(/[._-]/)
                .filter(Boolean)
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(' ') || 'Executive Member',
            role: role || 'customer',
            city: 'Bengaluru',
            tier: 'Executive Tier',
            avatarUrl: DEFAULT_PROFILE_AVATAR,
          };

      const user = await getOrCreateUser({
        uid: persona.uid,
        email: persona.email,
        name: persona.name,
        role: persona.role,
        tier: persona.tier,
        avatarUrl: persona.avatarUrl,
        city: persona.city,
      });

      const token = signPersonaToken({
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: (user.role as 'customer' | 'provider' | 'admin') || 'customer',
        city: user.city || 'Bengaluru',
        tier: user.tier || 'Executive Tier',
        avatarUrl: user.avatarUrl || DEFAULT_PROFILE_AVATAR,
        exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
      });

      res.json({ token, user });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication failed.';
      console.error('Persona login error:', error);
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const user = await getOrCreateUser({
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        tier: req.user.tier,
        avatarUrl: req.user.avatarUrl,
        city: req.user.city,
      });
      res.json({ user });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load profile.';
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/me/role', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { role } = req.body as { role?: 'customer' | 'provider' | 'admin' };
      if (!role || !['customer', 'provider', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role selected.' });
      }
      const updated = await updateUserRole(req.user.uid, role);
      res.json({ user: updated });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to switch role.';
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/providers', requireAuth, async (req: AuthRequest, res) => {
    try {
      const [allProviders, savedIds] = await Promise.all([
        listProviders(),
        listSavedProviderIds(req.user!.uid),
      ]);
      res.json({ providers: allProviders, savedIds });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch providers.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/providers', requireAuth, async (req: AuthRequest, res) => {
    try {
      const {
        name,
        title,
        specialty,
        category,
        location,
        feeInr,
        durationMin,
        nextAvailableLabel,
        availableSlots,
        bio,
      } = req.body;

      if (!name || !title || !specialty || !location) {
        return res.status(400).json({ error: 'Name, title, specialty, and location are required.' });
      }

      const created = await createProvider({
        name: String(name),
        title: String(title),
        specialty: String(specialty),
        category: String(category || 'Consultations'),
        location: String(location),
        feeInr: Number(feeInr) || 1500,
        durationMin: Number(durationMin) || 45,
        nextAvailableLabel: String(nextAvailableLabel || 'Tomorrow 10:00 AM'),
        availableSlots: Array.isArray(availableSlots)
          ? availableSlots.map(String)
          : ['10:00 AM', '2:00 PM', '4:30 PM'],
        bio: String(bio || 'Verified AUREVIA executive specialist.'),
      });

      res.status(201).json({ provider: created });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create provider.';
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/providers/:id/status', requireAuth, async (req: AuthRequest, res) => {
    try {
      const providerId = Number(req.params.id);
      const { isActive } = req.body as { isActive: boolean };
      const updated = await toggleProviderActive(providerId, Boolean(isActive));
      res.json({ provider: updated });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update provider.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/providers/:id/bookmark', requireAuth, async (req: AuthRequest, res) => {
    try {
      const providerId = Number(req.params.id);
      const result = await toggleSavedProvider(req.user!.uid, providerId);
      res.json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to toggle bookmark.';
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/appointments', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser({
        uid: req.user!.uid,
        email: req.user!.email,
        name: req.user!.name,
      });
      const rows = await listAppointments(req.user!.uid, user.role);
      res.json({ appointments: rows });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load appointments.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/appointments', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { providerId, dateLabel, timeSlot, notes, bookedViaAi } = req.body;
      if (!providerId || !dateLabel || !timeSlot) {
        return res.status(400).json({ error: 'Provider, date, and time slot are required.' });
      }
      const user = await getOrCreateUser({
        uid: req.user!.uid,
        email: req.user!.email,
        name: req.user!.name,
      });
      const created = await createAppointment({
        userUid: req.user!.uid,
        customerName: user.name,
        providerId: Number(providerId),
        dateLabel: String(dateLabel),
        timeSlot: String(timeSlot),
        notes: notes ? String(notes) : undefined,
        bookedViaAi: Boolean(bookedViaAi),
      });
      res.status(201).json({ appointment: created });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to book appointment.';
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/appointments/:id/reschedule', requireAuth, async (req: AuthRequest, res) => {
    try {
      const appointmentId = Number(req.params.id);
      const { dateLabel, timeSlot } = req.body;
      if (!dateLabel || !timeSlot) {
        return res.status(400).json({ error: 'New date and time slot are required.' });
      }
      const user = await getOrCreateUser({
        uid: req.user!.uid,
        email: req.user!.email,
        name: req.user!.name,
      });
      const updated = await rescheduleAppointment(
        appointmentId,
        req.user!.uid,
        user.role,
        String(dateLabel),
        String(timeSlot)
      );
      res.json({ appointment: updated });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reschedule appointment.';
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/appointments/:id/status', requireAuth, async (req: AuthRequest, res) => {
    try {
      const appointmentId = Number(req.params.id);
      const { status } = req.body as { status: 'Confirmed' | 'Cancelled' | 'Completed' };
      if (!['Confirmed', 'Cancelled', 'Completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status.' });
      }
      const user = await getOrCreateUser({
        uid: req.user!.uid,
        email: req.user!.email,
        name: req.user!.name,
      });
      const updated = await updateAppointmentStatus(
        appointmentId,
        req.user!.uid,
        user.role,
        status
      );
      res.json({ appointment: updated });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update status.';
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/activity', requireAuth, async (req: AuthRequest, res) => {
    try {
      const logs = await listActivityLogs(req.user!.uid);
      res.json({ activity: logs });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load activity.';
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/ai/chat', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser({
        uid: req.user!.uid,
        email: req.user!.email,
        name: req.user!.name,
      });
      const messages = await listChatMessages(user.uid);
      res.json({ messages });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load chat.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/ai/chat', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { message } = req.body as { message?: string };
      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Booking request message cannot be empty.' });
      }

      const user = await getOrCreateUser({
        uid: req.user!.uid,
        email: req.user!.email,
        name: req.user!.name,
      });

      const userMsg = await appendChatMessage({
        userUid: user.uid,
        sender: 'user',
        text: message.trim(),
      });

      const [allProviders, existingAppointments] = await Promise.all([
        listProviders(),
        listAppointments(user.uid, user.role),
      ]);

      const activeProviders = allProviders.filter((p) => p.isActive);
      const ai = getGeminiClient();

      const providerContext = activeProviders.map((p) => ({
        id: p.id,
        name: p.name,
        specialty: p.specialty,
        title: p.title,
        location: p.location,
        feeInr: p.feeInr,
        durationMin: p.durationMin,
        availableToday: p.availableToday,
        nextAvailableLabel: p.nextAvailableLabel,
        availableSlots: p.availableSlots,
      }));

      const bookedContext = existingAppointments
        .filter((a) => a.status !== 'Cancelled')
        .map((a) => ({
          providerName: a.providerName,
          dateLabel: a.dateLabel,
          timeSlot: a.timeSlot,
        }));

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `User (${user.name}, ${user.city || 'Bengaluru'}) asks: "${message.trim()}"\n\nAvailable Providers:\n${JSON.stringify(providerContext, null, 2)}\n\nExisting Confirmed Appointments (avoid conflicts):\n${JSON.stringify(bookedContext, null, 2)}`,
        config: {
          systemInstruction:
            'You are the AUREVIA AI Booking Concierge. Respond concisely with a refined, helpful executive tone. Analyze the user request against the provided list of providers and existing appointments, and recommend 2 to 3 concrete, clash-free appointment slots using ONLY providerId values from the provided list. Mark the best match as recommended=true.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description:
                  'Concise concierge response explaining the matched clash-free slots.',
              },
              slots: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    providerId: { type: Type.INTEGER },
                    dateLabel: { type: Type.STRING },
                    timeSlot: { type: Type.STRING },
                    tierLabel: { type: Type.STRING },
                    matchNote: { type: Type.STRING },
                    recommended: { type: Type.BOOLEAN },
                  },
                  required: [
                    'providerId',
                    'dateLabel',
                    'timeSlot',
                    'tierLabel',
                    'matchNote',
                    'recommended',
                  ],
                },
              },
            },
            required: ['reply', 'slots'],
          },
        },
      });

      const rawJson = (response.text || '{}').trim();
      const parsed = JSON.parse(rawJson) as {
        reply?: string;
        slots?: Array<{
          providerId: number;
          dateLabel: string;
          timeSlot: string;
          tierLabel: string;
          matchNote: string;
          recommended: boolean;
        }>;
      };

      const providerMap = new Map(activeProviders.map((p) => [p.id, p]));
      const fallbackProvider = activeProviders[0];

      const suggestedSlots: SuggestedSlotItem[] = (parsed.slots || [])
        .slice(0, 3)
        .map((s, idx) => {
          const prov = providerMap.get(s.providerId) || fallbackProvider;
          return {
            providerId: prov.id,
            providerName: prov.name,
            providerSpecialty: prov.specialty,
            providerAvatar: prov.avatarUrl,
            location: prov.location,
            dateLabel: s.dateLabel,
            timeSlot: s.timeSlot,
            durationMin: prov.durationMin,
            tierLabel: s.tierLabel || (idx === 0 ? 'Optimal Match' : 'Standard Routine'),
            matchNote: s.matchNote || 'Clash-free availability',
            recommended: Boolean(s.recommended ?? idx === 0),
          };
        });

      const assistantMsg = await appendChatMessage({
        userUid: user.uid,
        sender: 'assistant',
        text:
          parsed.reply ||
          'I checked clinician schedules and selected the cleanest clash-free slots for your request.',
        suggestedSlots,
      });

      res.json({ userMessage: userMsg, assistantMessage: assistantMsg });
    } catch (error: unknown) {
      console.error('Gemini AI booking error:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'AI scheduling concierge encountered an error.';
      res.status(502).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`AUREVIA server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
