import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Supabase Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serve static files from the React app
app.use(express.static(join(__dirname, 'dist')));

// Helper: Verify Supabase JWT
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new Error('Invalid token');
    req.userId = user.id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};

// Google OAuth2 Configuration
const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google OAuth credentials missing');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

// GET /api/calendar/auth - Initiate Google OAuth flow
app.get('/api/calendar/auth', authMiddleware, (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state: req.userId, // Pass userId to callback via state
    });

    res.json({ success: true, authUrl });
  } catch (error) {
    console.error('Auth config error:', error.message);
    res.status(500).json({ success: false, error: 'Google Calendar integration not configured' });
  }
});

// GET /api/calendar/callback - Handle Google OAuth callback
app.get('/api/calendar/callback', async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    return res.redirect(`${process.env.CLIENT_URL}?calendar_error=missing_params`);
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        google_calendar_connected: true
      })
      .eq('id', userId);

    if (error) throw error;

    res.redirect(`${process.env.CLIENT_URL}?calendar_success=true`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}?calendar_error=oauth_failed`);
  }
});

// Helper: Get Authorized Calendar Client
const getAuthorizedCalendar = async (userId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('google_access_token, google_refresh_token, google_token_expiry')
    .eq('id', userId)
    .single();

  if (error || !user || !user.google_access_token) {
    throw new Error('User not connected to Google Calendar');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: user.google_access_token,
    refresh_token: user.google_refresh_token,
    expiry_date: user.google_token_expiry ? new Date(user.google_token_expiry).getTime() : null
  });

  // Handle token refresh
  oauth2Client.on('tokens', async (tokens) => {
    const updateData = {
      google_access_token: tokens.access_token,
      google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null
    };
    if (tokens.refresh_token) {
      updateData.google_refresh_token = tokens.refresh_token;
    }
    await supabase.from('users').update(updateData).eq('id', userId);
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
};

// GET /api/calendar/status - Check connection status
app.get('/api/calendar/status', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('google_calendar_connected')
      .eq('id', req.userId)
      .single();

    res.json({
      success: true,
      connected: !!(user?.google_calendar_connected)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch status' });
  }
});

// POST /api/calendar/add-event - Add a single event
app.post('/api/calendar/add-event', authMiddleware, async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;
    const calendar = await getAuthorizedCalendar(req.userId);

    const event = {
      summary: `Velora Deadline: ${title}`,
      description: `${description}\n\nSynced from Velora`,
      start: { dateTime: startTime, timeZone: 'UTC' },
      end: { dateTime: endTime || new Date(new Date(startTime).getTime() + 3600000).toISOString(), timeZone: 'UTC' },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 }, // 24h
          { method: 'popup', minutes: 60 },   // 1h
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    res.json({ success: true, eventId: response.data.id });
  } catch (error) {
    console.error('Add event error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/calendar/sync-deadlines - Bulk sync
app.post('/api/calendar/sync-deadlines', authMiddleware, async (req, res) => {
  try {
    const { deadlines } = req.body;
    const calendar = await getAuthorizedCalendar(req.userId);
    const results = [];

    for (const deadline of deadlines) {
      const event = {
        summary: `Velora Deadline: ${deadline.title}`,
        description: `Project: ${deadline.project}\nPriority: ${deadline.priority}\nStatus: ${deadline.status}\nSynced from Velora`,
        start: { dateTime: deadline.dueDate, timeZone: 'UTC' },
        end: { dateTime: new Date(new Date(deadline.dueDate).getTime() + 3600000).toISOString(), timeZone: 'UTC' },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1440 },
            { method: 'popup', minutes: 60 },
          ],
        },
      };

      try {
        const response = await calendar.events.insert({ calendarId: 'primary', resource: event });
        results.push({ success: true, title: deadline.title, id: response.data.id });
      } catch (err) {
        results.push({ success: false, title: deadline.title, error: err.message });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/calendar/disconnect - Clear tokens
app.delete('/api/calendar/disconnect', authMiddleware, async (req, res) => {
  try {
    await supabase
      .from('users')
      .update({
        google_access_token: null,
        google_refresh_token: null,
        google_token_expiry: null,
        google_calendar_connected: false
      })
      .eq('id', req.userId);

    res.json({ success: true, message: 'Disconnected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to disconnect' });
  }
});


// POST /api/team/invite - Send email invitation
app.post('/api/team/invite', authMiddleware, async (req, res) => {  try {
    const { name, email, role, project } = req.body;

    // Validate input
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and role are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate role
    const validRoles = ['MEMBER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be MEMBER or ADMIN'
      });
    }

    // Send email using Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Email service not configured'
      });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    // IMPORTANT: Resend can block sending to other recipients unless your from-address is on a verified domain.
    // If you are currently in Resend "testing" mode, only your own email can be used.
const fromEmail = process.env.INVITE_FROM_EMAIL;

if (!fromEmail) {
   return res.status(500).json({
      success:false,
      error:'INVITE_FROM_EMAIL missing'
   });
}

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: `You're invited to join Velora`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invitation to Join Velora</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Velora</h1>
              </div>
              <div class="content">
                <p>Hello <strong>${name}</strong>,</p>
                <p>You have been invited to join <strong>Velora</strong> as a <strong>${role}</strong>.</p>
                ${project ? `<p>You will be working on the project: <strong>${project}</strong></p>` : ''}
                <p>Click the button below to accept your invitation and get started:</p>
                <a href="${clientUrl}" class="button">Accept Invitation</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${clientUrl}</p>
              </div>
              <div class="footer">
                <p>This invitation was sent by the Velora team. If you didn't expect this invitation, you can safely ignore this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({
        success: false,
        error: 'Failed to send invitation email'
      });
    }

    const emailData = await emailResponse.json();

    res.json({
      success: true,
      message: 'Invitation sent successfully',
      emailId: emailData.id
    });

  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
