import type { Review } from '../../types/content';

export function ReviewCard({ review, index }: { review: Review; index: number }) {
  return <article className="review-card"><span className="review-card__index">0{index + 1}</span><div className="stars"><span aria-hidden="true">★★★★★</span><span className="sr-only">Cinco estrellas</span></div><blockquote>“{review.text}”</blockquote><p>— {review.source}</p></article>;
}
