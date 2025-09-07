// Mock de funciones de autorización
export function canEdit(user: { email: string }, review: { user: { email: string } }) {
  return user.email === review.user.email;
}

export function canVote(user: { email: string }, review: { votes: Array<{ user: string }> }) {
  return !review.votes.some(v => v.user === user.email);
}
