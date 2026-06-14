/**
 * POST /api/save-ratings
 * Server-side handler to upsert player_ratings rows.
 * Uses the SERVICE ROLE key so it bypasses RLS — never expose this key client-side.
 */
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return Response.json(
        { success: false, message: 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL is not set on the server.' },
        { status: 500 }
      );
    }

    // Admin client — bypasses all RLS policies
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    const body = await request.json();
    const { rows } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return Response.json(
        { success: false, message: 'No rows provided.' },
        { status: 400 }
      );
    }

    const payload = rows.map(row => ({
      gamer_tag:   row.gamer_tag,
      attack:      Math.round(Number(row.attack)      || 0),
      defense:     Math.round(Number(row.defense)     || 0),
      passing:     Math.round(Number(row.passing)     || 0),
      consistency: Math.round(Number(row.consistency) || 0),
      clutch:      Math.round(Number(row.clutch)      || 0),
      mp:          Math.round(Number(row.mp)           || 0),
      wins:        Math.round(Number(row.wins)         || 0),
      draws:       Math.round(Number(row.draws)        || 0),
      losses:      Math.round(Number(row.losses)       || 0),
      goals:       Math.round(Number(row.goals)        || 0),
      gd:          Math.round(Number(row.gd)           || 0),
      points:      Math.round(Number(row.points)       || 0),
      updated_at:  new Date().toISOString(),
    }));

    const { error } = await adminSupabase
      .from('player_ratings')
      .upsert(payload, { onConflict: 'gamer_tag' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return Response.json(
        { success: false, message: error.message, code: error.code },
        { status: 400 }
      );
    }

    return Response.json({ success: true, saved: payload.length });

  } catch (err) {
    console.error('Error in /api/save-ratings:', err);
    return Response.json(
      { success: false, message: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
