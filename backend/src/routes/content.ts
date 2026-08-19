import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../db/supabaseClient.js';

const router = Router();

// --- CARDS ---

// Create a new card (admin only usually, but we leave it open for now as per previous mock logic)
router.post('/cards', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, category, rarity, baseAttack, baseDefense, baseSpeed, baseBrains, imageUrl } = req.body;
    
    if (!name || !category || !rarity) {
      res.status(400).json({ error: 'Name, category, and rarity are required' });
      return;
    }

    const totalStats = Number(baseAttack) + Number(baseDefense) + Number(baseSpeed) + Number(baseBrains);
    const id = `card_${randomUUID().slice(0, 8)}`;

    const { error } = await supabase.from('cards').insert({
      id,
      name,
      category,
      rarity,
      baseAttack: Number(baseAttack),
      baseDefense: Number(baseDefense),
      baseSpeed: Number(baseSpeed),
      baseBrains: Number(baseBrains),
      totalStats,
      imageUrl: imageUrl || ''
    });

    if (error) throw error;

    const { data: created } = await supabase.from('cards').select('*').eq('id', id).single();
    res.status(201).json(created);
  } catch (err: any) {
    console.error('[Cards] Create error:', err);
    res.status(500).json({ error: 'Failed to create card', detail: err.message });
  }
});

// --- TRIVIA ---

// Create a new trivia question linked to an event
router.post('/trivia', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { eventId, question, questionType, options, correctAnswer } = req.body;
    
    if (!eventId || !question || !correctAnswer) {
      res.status(400).json({ error: 'eventId, question, and correctAnswer are required' });
      return;
    }

    // Get the current max orderIndex for this event
    const { data: existing, error: countErr } = await supabase
      .from('trivia_questions')
      .select('orderIndex')
      .eq('eventId', eventId)
      .order('orderIndex', { ascending: false })
      .limit(1);
    
    let nextOrder = 0;
    if (existing && existing.length > 0) {
      nextOrder = existing[0].orderIndex + 1;
    }

    const id = `trivia_${randomUUID().slice(0, 8)}`;

    const { error } = await supabase.from('trivia_questions').insert({
      id,
      eventId,
      orderIndex: nextOrder,
      question,
      questionType: questionType || 'mc',
      options: options || [],
      correctAnswer,
      status: 'published'
    });

    if (error) throw error;

    const { data: created } = await supabase.from('trivia_questions').select('*').eq('id', id).single();
    res.status(201).json(created);
  } catch (err: any) {
    console.error('[Trivia] Create error:', err);
    res.status(500).json({ error: 'Failed to create trivia', detail: err.message });
  }
});

// Get next queued trivia question for a user at an event
router.get('/events/:eventId/next-trivia', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { eventId } = req.params;

    // Fetch all published trivia for this event ordered by orderIndex
    const { data: allTrivia, error: fetchErr } = await supabase
      .from('trivia_questions')
      .select('*')
      .eq('eventId', eventId)
      .eq('status', 'published')
      .order('orderIndex', { ascending: true });

    if (fetchErr) throw fetchErr;
    if (!allTrivia || allTrivia.length === 0) {
      res.status(404).json({ error: 'No trivia found for this event' });
      return;
    }

    // Fetch user attempts for these trivia
    const triviaIds = allTrivia.map(t => t.id);
    const { data: attempts, error: attemptsErr } = await supabase
      .from('user_trivia_attempts')
      .select('triviaId')
      .eq('userId', userId)
      .in('triviaId', triviaIds);

    if (attemptsErr) throw attemptsErr;

    const attemptedIds = new Set((attempts || []).map(a => a.triviaId));
    
    // Find the first trivia question the user hasn't attempted yet
    const nextTrivia = allTrivia.find(t => !attemptedIds.has(t.id));

    if (!nextTrivia) {
      res.status(404).json({ error: 'You have completed all trivia for this event!' });
      return;
    }

    // Omit correctAnswer from payload
    const safePayload = {
      id: nextTrivia.id,
      eventId: nextTrivia.eventId,
      question: nextTrivia.question,
      questionType: nextTrivia.questionType,
      options: nextTrivia.options
    };

    res.json(safePayload);
  } catch (err: any) {
    console.error('[Trivia] Get next error:', err);
    res.status(500).json({ error: 'Failed to fetch next trivia', detail: err.message });
  }
});

// Submit answer for a trivia question
router.post('/trivia/answer', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { triviaId, answer } = req.body;
    
    if (!triviaId || answer === undefined) {
      res.status(400).json({ error: 'triviaId and answer are required' });
      return;
    }

    // Get the trivia question
    const { data: trivia, error: triviaErr } = await supabase
      .from('trivia_questions')
      .select('*, events(cardReward, xpAward, essenceAward)')
      .eq('id', triviaId)
      .single();

    if (triviaErr || !trivia) {
      res.status(404).json({ error: 'Trivia not found' });
      return;
    }

    // Check if user already attempted
    const { data: existingAttempt } = await supabase
      .from('user_trivia_attempts')
      .select('id')
      .eq('userId', userId)
      .eq('triviaId', triviaId)
      .single();

    if (existingAttempt) {
      res.status(400).json({ error: 'You have already attempted this question' });
      return;
    }

    // Grade answer
    let isCorrect = false;
    if (trivia.questionType === 'mc') {
      // For mc, answer is the index (number)
      const selectedOptionText = trivia.options[Number(answer)];
      isCorrect = selectedOptionText === trivia.correctAnswer;
    } else {
      // For text, check if the user's answer contains any of the accepted comma-separated keywords
      const acceptedKeywords = (trivia.correctAnswer as string)
        .split(',')
        .map(a => a.trim().toLowerCase())
        .filter(Boolean);
      const userAnswer = String(answer).trim().toLowerCase();
      
      // Mark correct if the user's answer contains ANY of the keywords
      isCorrect = acceptedKeywords.some(keyword => userAnswer.includes(keyword));
    }

    // Record attempt
    await supabase.from('user_trivia_attempts').insert({
      id: `att_${randomUUID().slice(0, 8)}`,
      userId,
      triviaId,
      isCorrect
    });

    let cardData = null;
    const event = Array.isArray(trivia.events) ? trivia.events[0] : trivia.events;

    // Fetch the card reward to return it whether right or wrong (so they can see what they got/missed)
    if (event && event.cardReward) {
      const { data: card } = await supabase.from('cards').select('*').eq('id', event.cardReward).single();
      cardData = card;
    }

    if (isCorrect && event) {
      // Update User XP/Essence
      const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
      if (user) {
        let newLevel = user.level as number;
        let newCurrentXP = (user.currentXP as number) + (event.xpAward || 0);
        const newTotalXP = (user.totalXP as number) + (event.xpAward || 0);
        const newEssence = (user.essenceBalance as number) + (event.essenceAward || 0);

        let target = newLevel * 200;
        while (newCurrentXP >= target) {
          newCurrentXP -= target;
          newLevel += 1;
          target = newLevel * 200;
        }

        await supabase.from('users').update({
          level: newLevel,
          totalXP: newTotalXP,
          currentXP: newCurrentXP,
          essenceBalance: newEssence,
          updatedAt: new Date().toISOString()
        }).eq('id', userId);
      }

      // Award card if there is one
      if (event.cardReward) {
        // Check if user already owns this card to increment quantity, or insert new
        const { data: existingCard } = await supabase
          .from('user_cards')
          .select('id, quantity')
          .eq('userId', userId)
          .eq('cardId', event.cardReward)
          .single();

        if (existingCard) {
          await supabase.from('user_cards').update({
            quantity: existingCard.quantity + 1
          }).eq('id', existingCard.id);
        } else {
          await supabase.from('user_cards').insert({
            id: `inv_${userId}_${event.cardReward}_${Date.now()}`,
            userId,
            cardId: event.cardReward,
            level: 1,
            attackBonus: 0,
            defenseBonus: 0,
            speedBonus: 0,
            brainsBonus: 0,
            quantity: 1
          });
        }
      }
    }

    res.json({
      isCorrect,
      correctAnswer: trivia.correctAnswer,
      cardReward: cardData,
      xpAwarded: isCorrect && event ? event.xpAward : 0,
      essenceAwarded: isCorrect && event ? event.essenceAward : 0,
    });
  } catch (err: any) {
    console.error('[Trivia] Submit error:', err);
    res.status(500).json({ error: 'Failed to submit answer', detail: err.message });
  }
});

// Get completed events (where user has attempted all published trivia)
router.get('/player/completed-events', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { data: allTrivia } = await supabase.from('trivia_questions').select('id, eventId').eq('status', 'published');
    const { data: attempts } = await supabase.from('user_trivia_attempts').select('triviaId').eq('userId', userId);
    
    if (!allTrivia || !attempts) {
      res.json([]);
      return;
    }

    const attemptedIds = new Set(attempts.map(a => a.triviaId));
    
    const eventTriviaCount: Record<string, number> = {};
    const eventAttemptedCount: Record<string, number> = {};

    for (const t of allTrivia) {
      eventTriviaCount[t.eventId] = (eventTriviaCount[t.eventId] || 0) + 1;
      if (attemptedIds.has(t.id)) {
        eventAttemptedCount[t.eventId] = (eventAttemptedCount[t.eventId] || 0) + 1;
      }
    }

    const completed = [];
    for (const eventId in eventTriviaCount) {
      if (eventTriviaCount[eventId] === eventAttemptedCount[eventId]) {
        completed.push(eventId);
      }
    }

    res.json(completed);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch completed events', detail: err.message });
  }
});



export default router;
