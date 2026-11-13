/**
 * Utility to share digital token pass via WhatsApp or native Web Share API
 */
export function shareTokenPass(token) {
  if (!token) return;

  const shopName = token.shopName || 'Partner Store';
  const tokenNo = token.displayToken || `#${token.tokenNumber || '1'}`;
  const peopleAhead = token.peopleAhead ?? 0;
  const estWait = token.estimatedWaitMin ?? 0;
  const groupText = token.groupSize > 1 ? `Group (${token.groupSize} Persons)` : 'Single Person Pass';
  
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://abhiikhula.in';
  const trackingUrl = `${currentOrigin}/tokens`;

  const message = 
`🎟️ *AbhiiKhula Live Queue Pass*
🏪 *Store*: ${shopName}
🔢 *Token Number*: ${tokenNo}
👥 *Booking*: ${groupText}
⏳ *Queue Status*: ${peopleAhead} ahead (~${estWait} min wait)

👉 *Track our live turn here*:
${trackingUrl}`;

  // Try Native Web Share API first if on mobile
  if (typeof navigator !== 'undefined' && navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent || '')) {
    navigator.share({
      title: `AbhiiKhula Pass - ${tokenNo}`,
      text: message,
      url: trackingUrl,
    }).catch(() => {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    });
  } else {
    // Open WhatsApp Web / App
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  }
}

