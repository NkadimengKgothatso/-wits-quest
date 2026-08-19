import { supabase } from '../db/supabaseClient.js';


(async () => {
  const id = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  try {
    const { data, error } = await supabase
      .from('telemetry_audit')
      .insert([
        {
          id,
          user_id: 'usr_d5696ac0',
          incident_id: 'test',
          action: 'suspended',
          admin_email: 'admin@wits.ac.za',
        },
      ])
      .select()
      .single();
    if (error) throw error;
    console.log('INSERT RESULT', data);
  } catch (e) {
    console.error('INSERT ERROR', e);
  }
})();
