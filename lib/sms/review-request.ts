export function buildReviewRequestSms(input: {
  clientName: string
  reviewUrl: string
}): string {
  const firstName = input.clientName.trim().split(/\s+/)[0] || 'there'
  return `Hi ${firstName}, thank you for visiting Naturally Beautiful! We'd love your feedback: ${input.reviewUrl}`
}
